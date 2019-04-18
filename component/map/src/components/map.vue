<template>

  <div :id="id" v-if="isEmptyUrl" class="container">

  </div>
</template>
<script>
import * as maptalks from 'maptalks'
import * as services from '@/services/services'
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
      options: {items: []},
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
        zoom: 14,
        minZoom: 8,
        maxZoom: 18,
        baseLayer: new maptalks.TileLayer("base", {
          urlTemplate: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c']
        })
      });
      this.layer = new maptalks.VectorLayer('vector').addTo(this.map);
      this.hubLayer = new maptalks.VectorLayer('vector1').addTo(this.map);
      this.workerLayer = new maptalks.VectorLayer('vector2').addTo(this.map);
      this.camLayer = new maptalks.VectorLayer('vector3').addTo(this.map);
      /*this.map.on('click', (param) => {
            this.addMenu(param);
        });*/
      this.initContextMenu();
      this.setWorker();
      this.setIpcam();
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
    handleAddHub(e) {
      // show hub List
console.log(e)
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
                var itemObj = {
                    item: hub.name,
                    click: () => {
                        var location = {'x': this.contextCoordinate.x, 'y': this.contextCoordinate.y};
                        if (hubList[index]['custom'] === null) {
                            hubList[index]['custom'] = location;
                        } else {
                            hubList[index]['custom']['x'] = location['x'];
                            hubList[index]['custom']['y'] = location['y'];
                        }
                        //hubList[index]['custom']['location'] = this.contextCoordinate.x;
                        //hubList[index]['y'] = this.contextCoordinate.y;
                        //Array.prototype.push.apply(hubList[index], {'x': this.contextCoordinate.x, 'y':this.contextCoordinate.y});
                        console.log("1241",hubList[index]);
                        selectedCallback(hubList[index].name);
                        this.postHubLocation(hubList[index]);
                    }
                }
                if(hubList.length - index > 1) {
                    this.options.items.push(itemObj, '-');
                } else{
                    this.options.items.push(itemObj);
                }
            });
            console.log("options",this.options);
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
    ).addTo(this.hubLayer); // TODO: hub layer
    marker.on('click', () => {
      this.setMarkerWindow(hubId, marker);
    })
    this.markerMap.hubs[hubId] = marker;
  },
  setMarkerWindow(hubId, marker) {
    marker.setInfoWindow({
      'content': '<ul class="worker_menu">' +
        '<li class="worker-content" onload="video()"><img class="exampleimg" src="raspberrypi.svg"/></li>' +
        '<li class="worker"></li>' +
        '</ul>',
      'width': 300
    });
    marker.openInfoWindow();
  },
  postHubLocation(hub) {
    services.setHubLocation(hub);
    //this.marker.remove();
    //this.services.getGadget();
  },
  setWorker() {
    /*const beacons = getBeacons();
    console.log('beacons',beacons);*/
    const beacons = services.detectBeaconList("799b9f874bc1c50775233d2a0c00e388");
    //console.log("beacons",beacons);
    this.worker = new maptalks.Marker(
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
    })
  },
  setWorkerWindow() {
    this.worker.setInfoWindow({
      'content': '<ul class="worker_menu">' +
        '<li class="worker-content" onload="video()"><img class="exampleimg" src="raspberrypi.svg"/></li>' +
        '<li class="worker"></li>' +
        '</ul>',
      'width': 300
    });
    this.worker.openInfoWindow();
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
      'content': '<ul class="ipcam_menu">' +
        '<li class="ipcam-content" onload="video()"><img class="exampleimg" src="raspberrypi.svg"/></li>' +
        '<li class="ipcam"></li>' +
        '</ul>',
      'width': 300
    });
    this.ipcam.openInfoWindow();
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
