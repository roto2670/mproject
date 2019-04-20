<template>
<div :id="id" v-if="isEmptyUrl" class="container">

</div>
</template>
<script>
import * as maptalks from 'maptalks'
import * as services from '@/services/services'
import * as beaconDetector from '@/services/beacon-detector';
//import {CustomTool} from 'maptalks'
//import image from '@/assets/raspberrypi.svg'
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
      this.map = new maptalks.Map(this.id, {
        center: [127.113049, 37.498568],
        zoom: 20,
        minZoom: 8,
        maxZoom: 16,
        baseLayer: new maptalks.TileLayer("base", {
          // urlTemplate: 'icon-hub.png',
          urlTemplate: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          // tileSize: [1024, 1024],
          subdomains: ['a','b','c','d']
        })
      });
      this.layer = new maptalks.VectorLayer('vector').addTo(this.map);
      this.hubLayer = new maptalks.VectorLayer('vector1').addTo(this.map);
      this.workerLayer = new maptalks.VectorLayer('vector2').addTo(this.map);
      this.camLayer = new maptalks.VectorLayer('vector3').addTo(this.map);
      /*this.map.on('click', (param) => {
            this.addMenu(param);
        });*/
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
        /*'items': '<img class="hub" src="icon-hub.png"></img>' +
        '<div class="menu-content">' +
        '<ul class="custom_menu">' +
        '<li class="item1">Move Scanner</li>' +
        '<li class="item2">Add Scanner</li>' +
        '</ul>' +
        '</div>'*/
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
      // this.contextMenu.on('showend', (data) => {
      //   this.contextCoordinate = data.coordinate;
      // });
      // this.contextMenu   .on('hide remove', (data) => {
      //   this.contextCoordinate = null;
      // });
      /*console.log("{'x':" + param.coordinate.toFixed(5).x + ", 'y':" + param.coordinate.toFixed(5).y + "}");
      this._x = param.coordinate.toFixed(5).x;
      this._y = param.coordinate.toFixed(5).y;*/
      /*this.marker.openInfoWindow();
      document.getElementsByClassName('item1')[0].addEventListener('click', this.clickItem1);
      document.getElementsByClassName('item2')[0].addEventListener('click', this.clickItem2);*/
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
      //console.log(e);
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

          /*for (var _i in hubList) {
          hubIdList[_i] = getListFilter(hubList[_i], "name");
      };*/
          /*this.sethubListOption = {
              'items': [
                {
                  item: 'item1',
                  click: ''
                },
                '-', {
                  item: 'item2',
                  click: ''
                }
            ]
          };

          this.map.setMenu(this.sethubListOption).openMenu();*/
          if (hubList) {
            var geometry = new maptalks.Marker([this.contextCoordinate.x, this.contextCoordinate.y]).addTo(this.hubLayer);
            geometry.hide();
            /*for (var i in hubIdList) {
            hubs[i] = hubIdList[i].id;
            console.log('hubList', hubs[i]);
        }*/
            hubList.forEach((hub, index) => {
              // draw only no location hubs.
              if (!!hub.custom && !!hub.custom.map_location) {
                console.debug('The ${hub.name} hub has location data. so skip');
                return;
              }

              var itemObj = {
                item: hub.name,
                click: () => {
                  // var location = {
                  //   'x': this.contextCoordinate.x,
                  //   'y': this.contextCoordinate.y
                  // };
                  // if (hubList[index]['custom'] === null) {
                  //   hubList[index]['custom'] = location;
                  // } else {
                  //   hubList[index]['custom']['x'] = location['x'];
                  //   hubList[index]['custom']['y'] = location['y'];
                  // }
                  //hubList[index]['custom']['location'] = this.contextCoordinate.x;
                  //hubList[index]['y'] = this.contextCoordinate.y;
                  //Array.prototype.push.apply(hubList[index], {'x': this.contextCoordinate.x, 'y':this.contextCoordinate.y});
                  //console.log("1241",hubList[index]);
                  selectedCallback(hub.id);
                  // this.postHubLocation(hubList[index]);
                }
              }
              if (hubList.length - index > 1) {
                this.options.items.push(itemObj, '-');
              } else {
                this.options.items.push(itemObj);
              }
            });
            //console.log("options",this.options);
            /*var options = {
                'items': [{
                    item: hubList[0].name,
                    click: () => {
                        this.postHubLocation(hubList[0])
                    }
                  },
                  '-',
                  {
                    item: hubList[1].name,
                    click: () => {
                        this.postHubLocation(hubList[1])
                    }
                  }
                ]
            };*/
            geometry.setMenu(this.options).openMenu();
            // document.getElementsByClassName('item1')[0].addEventListener('click', this.postHubLocation(hubList));
            /*this.$store.commit('addHubs', hubs);
            this.$store.getters.getScannerList();*/
            //selectedCallback(hubs)
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
            'markerFile': 'icon-hub.png',
            'markerWidth': 40,
            'markerHeight': 40
          }
        }
      ).addTo(this.hubLayer);
      this.drawWorkers(hubId); // 허브 추가 시 비콘들을 주위에 뿌린다.
      marker.on('click', () => {
        this.showHubInfoWindow(hubId, marker);
      })
      this.markerMap.hubs[hubId] = marker;

      // Store hub location to server.
      this._updateHubLocation(hubId, coordinate.x, coordinate.y);
    },
    showHubInfoWindow(hubId, marker) {
      var context = '';
      services.detectBeaconList(hubId, (bcnList) => {
          console.log("baba", bcnList)
          if (bcnList) {
              bcnList.forEach((bcnlist, index) => {
                  context += '<li>';
                  context += bcnlist['gid'].slice(1, 10);
                  context += '</li>';
              })
              console.log("context",context);
              marker.setInfoWindow({
                  'content': '<ul class="worker_menu">' +
                    '<div class="worker"><div class="workerId"><div class="workerkey">SCANNER</div>'+ hubId.slice(1,4)+'</div>' +
                    '<div class="workerCount"><div class="workerkey">WORKER</div>' + bcnList.length + '</div></div>' +
                    '<ul class="workerInfo">' +
                    context +
                    '</ul></ul>',
                  'width': 350
              });
              marker.openInfoWindow();
            /*var title = '<ul class="worker_menu>';
            this.contentOptions.content += title;
            bcnList.forEach((hub, index) => {
              var contentObj = '<li class="worker-content">'
              if (bcnList.length - index > 1) {
                this.contentOptions.content += contentObj;
                this.contentOptions.content += bcnList[index]['gid'];
                this.contentOptions.content += '</li>';
              } else {
                this.contentOptions.content += contentObj;
                this.contentOptions.content += '</li></ul>';
                this.contentOptions.width += 300;
              }
          })*/
          } else {
            alert("There's no beaconData to load");
          }
        }, () => {
          console.log("Failed")
      });
        /*marker.setInfoWindow({
      'content': '<ul class="worker_menu">' +
        '<li class="worker-content" onload="video()"><img class="exampleimg" src="raspberrypi.svg"/></li>' +
        '<li class="worker"></li>' +
        '</ul>',
      'width': 300
  });*/
    },
    drawWorkers(hubId) {
        services.detectBeaconList(hubId, (bcnList) => {
            console.log("15151515",Math.random() / 100);
            console.log("qrqrsdsds", bcnList);
            if (bcnList) {
                bcnList.forEach((hubId, index) => {
                    this.bcns[index] = new maptalks.Marker(
                        [this.contextCoordinate.x + (Math.random() / 60), this.contextCoordinate.y +  (Math.random() / 60)], {
                            'symbol': {
                              'markerFile': 'icon-worker' + Math.ceil(Math.random() * 4) + '.svg',
                              'markerWidth': 50,
                              'markerHeight': 50
                            }
                        }
                    ).addTo(this.workerLayer);
                    this.bcns[index].on('click', () => {
                        this.setWorkerWindow(bcnList[index], this.bcns[index]);
                        console.log("afafafaf",bcnList[index]);
                    });
                });
                console.log("arybcn", this.bcns);
              /*var title = '<ul class="worker_menu>';
              this.contentOptions.content += title;
              bcnList.forEach((hub, index) => {
                var contentObj = '<li class="worker-content">'
                if (bcnList.length - index > 1) {
                  this.contentOptions.content += contentObj;
                  this.contentOptions.content += bcnList[index]['gid'];
                  this.contentOptions.content += '</li>';
                } else {
                  this.contentOptions.content += contentObj;
                  this.contentOptions.content += '</li></ul>';
                  this.contentOptions.width += 300;
                }
            })*/
            } else {
              alert("There's no beaconData to load");
            }
          }, () => {
            console.log("Failed")
        });

      /*const beacons = getBeacons();
      console.log('beacons',beacons);*/
      //const beacons = services.detectBeaconList("799b9f874bc1c50775233d2a0c00e388");
      /*this.worker = new maptalks.Marker(
        [127.109049, 37.486568], {
          'symbol': {
            'markerFile': 'icon-worker1.svg',
            'markerWidth': 50,
            'markerHeight': 50
          }
        }
      ).addTo(this.layer);
      this.worker.on('click', () => {
        this.setWorkerWindow();
    })*/
    },
    setWorkerWindow(bcnList, bcns) {
        console.log("aaffqq", bcnList);
        console.log("afafafaf", bcns);
      bcns.setInfoWindow({
        'content': '<div class="bcns">' +
        '<div class="bcnsInfo"><div class="bcnskey">DUMP TRUCK</div>' + bcnList.gid.slice(1, 10) + '</div>'+
        '<img class="bcnsImg" src="item.png"></img>' +
        '</div>',
        'width': 400
      });
      bcns.openInfoWindow();
    },
    setIpcam() {
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

.menu-content {
  width: 100%;
  background-color: rgb(42 147 240);
  border-radius: 15px;
  overflow: hidden
}

.custom_menu {
  width: 100%;
  color: white;
  background-color: rgb(42 147 240);
  list-style: none;
  padding: 0;
  text-align: center;
  margin-block-end: 0
}

.custom_menu li {
  background: rgb(73 169 243);
  font-size: 13px;
  line-height: 24px;
  width: 200px;
  height: 26px
}

.custom_menu li:hover {
  background: rgb(42 147 240);
  cursor: pointer
}

.custom_menu li+li {
  border-top: 1px solid rgb(42 147 240);
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
  overflow-x: hidden
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

}

.bcnskey {
  font-size: x-small
}

.bcnsImg {
  height: 250px;
  width: 300px;
  margin-left: 100px;
}

.bcnsInfo {
  width: 100px;
  height: 250px;
  color: white;
  background-color: rgb(93 224 219);
  padding-top: 50px;
  font-size: large;
  position: absolute;
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
