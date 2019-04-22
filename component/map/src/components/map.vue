<template>
<div :id="id" v-if="isEmptyUrl" class="container">

</div>
</template>
<script>
import * as maptalks from 'maptalks'
import * as services from '@/services/services'
import * as beaconDetector from '@/services/beacon-detector';
export default {
  name: 'Map',
  data() {
    return {
      id: 'map',
      map: null,
      point: null,
      url: '',
      layer: '',
      hubLayer: '',
      workerLayer: '',
      camLayer: '',
      worker: '',
      workers: [],
      ipcam: '',
      ipcams: [],
      _x: '',
      _y: '',
      hubs: '',
      contextCoordinate: null,
      contextMenu: null,
      hubSelectMenu: null,
      sethubListOption: null,
      hubs: null,
      bcns: {},
      options: {
        items: []
      },
      contentOptions: {
        content: '',
        width: ''
      },
      markerMap: {
        hubs: {},
        gadgets: {},
        cams: {}
      },
      i: 0
    }
  },
  methods: {
    initloadMap() {
      // Options
      // http://maptalks.org/maptalks.js/api/0.x/Map.html#options
      this.map = new maptalks.Map(this.id, {
        center: [90, 50],
        zoom: 6,
        maxZoom: 6,
        minZoom: 4,
        // Extent
        // http://maptalks.org/maptalks.js/api/0.x/Extent.html
        maxExtent: new maptalks.Extent(5, 5, 170, 80),
        zoomAnimation: false,
        zoomInCenter: true,
        panAnimation: false,
        dragRotate: false,
        dragPitch: false,
        drgaRotatePitch: false,
        touchGesture: false,
        touchZoom: false,
        touchRotate: false,
        touchPitch: false,
        touchZoomRotate: false,
        doubleClickZoom: false,
        // Image Layer
        // http://maptalks.org/maptalks.js/api/0.x/ImageLayer.html
        baseLayer: new maptalks.ImageLayer("base", [{
          url: 'map.png',
          extent: [0, 0, 180, 85],
          opactiy: 1
        }], {
          opactiy: 1
        })
      });
      // #### Worldmap code
      // this.map = new maptalks.Map(this.id, {
      //   center: [127.113049, 37.498568],
      //   //center: [0, 0],
      //   zoom: 20,
      //   minZoom: 8,
      //   maxZoom: 16,
      //   baseLayer: new maptalks.TileLayer("base", {
      //     // urlTemplate: 'icon-hub.png',
      //     urlTemplate: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      //     subdomains: ['a','b','c','d']
      //   })
      // });
      this.layer = new maptalks.VectorLayer('vector').addTo(this.map);
      this.hubLayer = new maptalks.VectorLayer('vector1').addTo(this.map);
      this.workerLayer = new maptalks.VectorLayer('vector2').addTo(this.map);
      this.camLayer = new maptalks.VectorLayer('vector3').addTo(this.map);
      this.initBeaconLocationHandler();
      this.initContextMenu();
      this.loadHubs();
      this.setIpcam();
    },
    initBeaconLocationHandler() {
      // run beacon detector.
      this.beaconDetector = new beaconDetector.BeaconDetector((beacons) => {

      });

      // start
      this.beaconDetector.start();
    },
    initContextMenu() {
      this.contextMenuOption = {
        'items': [{
          item: 'Add Scanner',
          click: this.handleAddHub
        }]
      };
      // Create context menu
      this.contextMenu = this.map.setMenu(this.contextMenuOption).openMenu();
      // Default option is show, so hide here
      this.map.closeMenu()

      // Init EventHandler
      this.map.on('contextmenu', (e) => {
        this.contextCoordinate = e.coordinate;
        this.map.openMenu(e.coordinate);
      });
    },
    loadHubs() {
      console.debug('Try load hubs');
      let hubs = services.getHubs((hubList) => {
        console.debug('Load hubs.', hubList);
        // Store hubs.
        this.$store.commit('addHubs', hubList); // TODO; move to services?

        // draw hub if has location data.
        hubList.forEach((hub) => {
          let location = hub.custom && hub.custom.map_location;
          if (!!location) {
            this.drawHub(hub.id, location);
          }
        });
      });
    },
    handleAddHub(e) {
      // show hub List
      this.showhubList((selectedId) => {
        this.map.closeMenu(selectedId);
        this.drawHub(selectedId, this.contextCoordinate);
      })
      // draw hub
    },
    showhubList(selectedCallback) {
      this.map.closeMenu();
      // TODO
      services.getHubs((hubList) => {
          this.$store.commit('addHubs', hubList);
          // Clear old hub list view
          this.options.items = []; // TODO: destory for GC?

          if (hubList) {
            var geometry = new maptalks.Marker([this.contextCoordinate.x, this.contextCoordinate.y]).addTo(this.hubLayer);
            geometry.hide();
            hubList.forEach((hub, index) => {
              // draw only no location hubs.
              if (!!hub.custom && !!hub.custom.map_location) {
                console.debug('The ${hub.name} hub has location data. so skip');
                return;
              }

              var itemObj = {
                item: hub.name,
                click: () => {
                  selectedCallback(hub.id);
                }
              }
              if (hubList.length - index > 1) {
                this.options.items.push(itemObj, '-');
              } else {
                this.options.items.push(itemObj);
              }
            });
            geometry.setMenu(this.options).openMenu();
          } else {

          }
        },
        function(error) {
          console.warn('Failed to load hub list.');
        });

    },
    /*
       hubDataList = {id: String, coordinate: Coordonate}
    */
    drawHubs(hubDataList) {
      if (Array.isArray(hubDataList)) {
        hubIds.forEach(function(hubData) {
          this.drawHub(hubData.id, hubData.coordinate);
        });
      } else {
        console.warn('Failed to draw hubs by given id is empty or null.');
      }
    },
    drawHub(hubId, coordinate) {
      console.debug('Try draw hub, id: ', hubId);
      let marker = new maptalks.Marker(
        [coordinate.x, coordinate.y], {
          'symbol': {
              markerFile: 'icon-hub.png',
              markerWidth: 40,
              markerHeight: 40,
            }
        }
      ).addTo(this.hubLayer);
      this.drawWorkers(hubId, coordinate); // 허브 추가 시 비콘들을 주위에 뿌린다.
      marker.on('click', () => {
        this.showHubInfoWindow(hubId, marker);
      })
      this.markerMap.hubs[hubId] = marker;

      // Store hub location to server.
      this._updateHubLocation(hubId, coordinate.x, coordinate.y);
    },
    removeHubMarker(hubId) {
      console.debug('Try remove hub marker, id: $hubId');

      let hubMarker = this.markerMap.hubs[hubId];
      if (!!hubMarker) {
        // remove location in hub model
        let hub = this.$store.getters.getHub(hubId);
        if (!!hub) {
          delete hub.custom.map_location;
          services.setHubLocation(hub);
        } else {
          console.warn('Failed to clear hub location, cannot found hub model by given id: $hubId');
        }

        hubMarker.remove();
      } else {
        console.warn('Failed to remove hub marker, cannot find marker by ginve id: $hubId');
      }

      // remove children markers
      this.removeGadgetMakers(hubId);

      // delete in cahces
      delete this.markerMap.hubs[hubId];
    },
    removeGadgetMakers(hubId) {
      console.log('Try remove hub markers for id: ${hubId}');
      let gadgetMarkers = this.markerMap.gadgets[hubId];
      if (!!gadgetMarkers) {
        gadgetMarkers.forEach((marker) => {
          marker.remove();
        })
      } else {
        console.warn('Failed to remove gadget markers by given id: ${hubId}');
      }

      // clear in cache.
      delete this.markerMap.gadgets[hubId];
    },
    showHubInfoWindow(hubId, marker) {
      let context = '';
      let hub = this.$store.getters.getHub(hubId);
      services.detectBeaconList(hubId, (beacons) => { // TODO: deferred
        if (beacons) {
            let gadgetIds =
            services.getGadgets(beacons.map(beacon => {
                return beacon.gid;
            }), (gadgets) => {
                gadgets.forEach((gadget) => {
                    context += '<li>';
                    context += gadget.name || 'no name';
                    context += '</li>';
                })
                marker.setInfoWindow({ // TODO: vue component
                content: '<ul class="worker_menu">' +
                    '<div class="worker"><div class="workerId"><div class="workerkey">SCANNER</div>'+ hub.name +'</div>' +
                    '<div class="workerCount"><div class="workerkey">WORKER</div>' + gadgets.length + '</div>' +
                    '<button class="hub-remove-button">Remove</button></div>' +
                    '<ul class="workerInfo">' +
                    context +
                    '</ul></ul>',
                'width': 350
                });
                marker.openInfoWindow();

                let vm = this;
                document.getElementsByClassName('hub-remove-button')[0].onclick = function() { // TODO: suck
                    vm.removeHubMarker(hubId);
                }
            }, () => {
                // TODO:
                console.warn('Failed to load gadgets for hub id: $hubId');
            })
        } else {
          alert("There's no beaconData to load");
        }
        }, () => {
          console.log("Failed")
      });
    },
    drawWorkers(hubId, coordinate) {
        services.detectBeaconList(hubId, (beacons) => {
            if (beacons) {
                beacons.forEach((beacon, index) => {
                    let marker = new maptalks.Marker(
                        [coordinate.x + (Math.random() * 6), coordinate.y +  (Math.random() * 6)], {
                            'symbol': {
                              'markerFile': 'icon-worker' + Math.ceil(Math.random() * 4) + '.svg',
                              'markerWidth': 50,
                              'markerHeight': 50
                            }
                        }
                    ).addTo(this.workerLayer);
                    marker.on('click', () => {
                        this.showGadgetInFoWindow(beacon.gid, this.bcns[index]);
                    });
                    this.bcns[index] = marker;

                    // add in cache
                    var markerCache = this.markerMap.gadgets[hubId];
                    if (!markerCache) {
                        markerCache = [];
                        this.markerMap.gadgets[hubId] = markerCache;
                    }
                    markerCache.push(marker);
                });
            } else {
              alert("There's no beaconData to load");
            }
          }, () => {
            console.log("Failed")
        });
    },
    showGadgetInFoWindow(gadgetId, marker) {
        services.getGadget(gadgetId, (gadget) => {
            marker.setInfoWindow({
                'content': '<div class="bcns">' +
                '<div class="bcnsInfo"><div class="bcnskey">Name</div>' +
                '<div class="bcnName">' + (gadget.name || 'no name') + '</div>' +
                '</div>' + '<img class="bcnsImg" src="item.png"></img>' +
                '</div>',
                'width': 400,
                'bottom': 11
            });
            marker.openInfoWindow();
        }, (error) => {
            console.warn('Failed to show gadget info window, no gadget by given id: ${gadgetId}');
        });
    },
    setIpcam() {
        return; // TODO: impl.
        this.ipcam = new maptalks.Marker(
            [127.113049, 37.498568], {
            'symbol': {
                'markerFile': 'icon-ipcam.svg',
                'markerWidth': 50,
                'markerHeight': 50
            }
            }
        ).addTo(this.layer);
        this.ipcam.on('click', () => {
            this.setIpcamWindow();
        })
    },
    setIpcamWindow() {
      this.ipcam.setInfoWindow({
          'content': '<div class="bcns">' +
          '<div class="bcnsInfo"><div class="bcnskey">IPCAM</div></div>'+
          '<img class="bcnsImg" src="item.png"></img>' +
          '</div>',
          'width': 400
      });
      this.ipcam.openInfoWindow();
    },
    _updateHubLocation(hubId, x, y) {
      let hub = this.$store.getters.getHub(hubId);
      if (!!hub && !!x && !!y) {
        if (!!!hub.custom) {
          hub.custom = {};
        }
        hub.custom.map_location = {
          x: x,
          y: y
        };

        // send to server.
        services.setHubLocation(hub);
      } else {
        console.warn('Failed to update hub location, given parms cannot be null.', hub, x, y);
      }
    }
  },
  computed: {
    isEmptyUrl() {
      return !!!this.url
    }
  },
  created() {
    this.$emit('select-button');
  },
  mounted() {
    this.initloadMap();
  }
}
</script>
<style>

#map {
  width: 100%;
  height: 100%;
}

#info {
  position: fixed;
  background-color: rgba(13, 13, 13, 0.5);
  padding: 10px 10px 10px 10px;
  font: 13px bold sans-serif;
  color: #fff;
  right: 20px;
  top: 20px;
  width: 100px;
  height: 40px;
  overflow: hidden
}

.hub {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  position: absolute;
  margin-left: 50px;
  margin-top: 15px
}

.maptalks-canvas-layer {
  padding-top: 40px;
}

.maptalks-menu {
  width: 100%;
  background: rgb(42 147 240) !important;
  border-radius: 10px;
  overflow: hidden;
  border : none !important;
}

.maptalks-menu .maptalks-menu-items {
  width: 100%;
  color: white !important;
  font-weight: bold;
  background: rgb(42 147 240);
  list-style: none;
  padding: 0;
  text-align: center;
  margin-block-end: 0
}

.maptalks-menu .maptalks-menu-items li {
  background: rgb(73 169 243);
  font-size: 13px;
  line-height: 24px;
}

.maptalks-menu .maptalks-menu-items li:hover {
  background: rgb(42 147 240);
  cursor: pointer
}

.maptalks-menu .maptalks-menu-items li+li {
  border-top: 1px solid rgb(42 147 240);
}

.maptalks-menu .maptalks-menu-items li.maptalks-menu-splitter {
  height: 1px !important;
}

.maptalks-msgBox {
  border: none !important;
  border-radius: 10px !important;
  background: none !important;
}

.maptalks-msgBox a.maptalks-close {
  width: 30px !important;
  height: 30px !important;
  background-size: 30px !important;
  top: -8px !important;
  background-color: rgba(255, 87, 87, 1) !important;
  border-radius: 4px !important;
}
.maptalks-msgBox a.maptalks-close.hover {
}

.maptalks-msgBox .maptalks-msgContent {
  padding: 0 !important;
}

.maptalks-msgBox em.maptalks-ico {
  display: none !important;
}

.worker_menu {
  width: 100%;
  list-style: none;
  padding: 0;
  text-align: center;
  margin-block-end: 0;
  border-radius: 10px;
  overflow: hidden;
  padding-top: 10px
}

.workerInfo {
  height: 240px;
  width: 250px;
  margin-left: 100px;
  background-color: rgb(42 160 240);
  padding-inline-start: 0;
  overflow: scroll;
  overflow-x: hidden;
  border-top-right-radius: 10px;
}

.workerId {
  width: 80px;
  height: 80px;
  margin-left: 10px;
  margin-top: 20px;
  color: white;
  text-align: center;
  overflow: hidden;
  font-weight: 900;
  font-size: large
}

.workerCount {
  width: 80px;
  height: 40px;
  margin-left: 10px;
  color: white;
  text-align: center;
  overflow: hidden;
  font-weight: 900;
  font-size: large
}

.workerkey {
  font-weight: 300;
  font-size: small;
}

.workerInfo li {
  background: white;
  opacity: 0.4;
  font-size: 13px;
  line-height: 30px;
  width: 250px;
  height: 30px;
  font-weight: bold;
  list-style-type: none
}

.workerInfo li:hover {
  background: rgb(42 147 240);
  cursor: pointer;
}

::-webkit-scrollbar {
  display: none;
}

.workerInfo li+li {
  border-top: 2px solid rgb(42 147 240)
}

.worker {
  height: 240px;
  width: 100px;
  margin-right: 230px;
  position: absolute;
  background-color: rgb(57 178 255);
  border-bottom-left-radius: 10px;
  border-top-left-radius: 10px;
}

.bcnskey {
  font-size: 14px;
  padding-top: 10px;
  padding-left: 10px;
}

.hub-remove-button {
  color: #ffffff;
  background-color: #87CEEB;
  border: solid 1px #00BFFF;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  margin-top:10px
}

.bcnName {
  font-size: 20px;
  padding-top: 10px;
  padding-left: 10px;
}

.bcnsImg {
  height: 250px;
  width: 260px;
  margin-left: 120px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.bcnsInfo {
  width: 120px;
  height: 250px;
  color: white;
  background-color: rgb(93 224 219);
  font-size: large;
  position: absolute;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.ipcam_menu {
  width: 100%;
  list-style: none;
  padding: 0;
  text-align: center;
  margin-block-end: 0;
  border-radius: 10px;
  overflow: hidden
}

.ipcam-content {
  height: 200px
}

.ipcam {
  height: 60px;
  background-color: rgb(93 224 219)
}

.exampleimg {
  height: 100%
}
</style>
