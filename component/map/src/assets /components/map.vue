<template>
<div :id="id" v-if="isEmptyUrl" class="container">
</div>
</template>
<script>
import * as maptalks from 'maptalks'
import {
  setHubLocation
} from '../services/services'
import {
  getHubs
} from '../services/services'
import {
  getBeacons
} from '../services/services'
import {
  detectBeaconList
} from '../services/services'
//import {CustomTool} from 'maptalks'
//import image from '@/assets/raspberrypi.svg'
export default {
  name: 'Map',
  data() {
    return {
      id: 'map',
      map: null,
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
      contextCoordinate: null,
      contextMenu: null,
      hubSelectMenu: null,
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
        baseLayer: new maptalks.WMSTileLayer("base", {
          urlTemplate: 'Updated Zone-A Simulation.png',
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
    handleAddHub() {
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
      getHubs(function(hubList) {

      }, function(error) {
          console.warn('Failed to load hub list.');
      });
      console.log(hubs);
      var hubList = [],
        length = null;
      if (hubs) {
        var geometry = new maptalks.Marker([this.contextCoordinate.x, this.contextCoordinate.y]).addTo(this.hubLayer);
        geometry.hide();
        for (var i in hubs) {
          hubList[i] = hubs[i].id;
          console.log('hubList', hubList[i]);
        }
        let hubListViewAsString = '<div class="menu-content">' +
          '<ul class="custom_menu">';
        var i = 1;
        hubList.forEach(function(hub) {
          hubListViewAsString += '<li class=item';
          hubListViewAsString += i;
          hubListViewAsString += '>';
          hubListViewAsString += hub;
          hubListViewAsString += '</li>';
          i++;
        });
        hubListViewAsString += '</ul></div>';
        console.log(hubListViewAsString);
        geometry.setInfoWindow({
          'content': hubListViewAsString,
          'width': 200
        });
        /*this.hubSelectMenuOptions = {
          'items': [{
              item: hubList[0],
              click: ''
            },
            '-',
            {
              item: 'asdasdf',
              click: ''
            },
            '-',
            {
              item: 'a34df',
              click: ''
            }, '-',
            {
              item: 'as123sdf',
              click: ''
          },
          {
            item: '',
            click: ''
          }
          ]

      };*/
        this.hubSelectMenu = geometry.openInfoWindow();
        /*this.$store.commit('addHubs', hubs);
        this.$store.getters.getScannerList();*/
        //selectedCallback(hubs)
      } else {

      }
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
    clickItem2() {
      const item = {
        "hub": {
          "id": "799b9f874bc1c50775233d2a0c00e388",
          "uuid": "240ac4a64c9e",
          "account_id": "cfb95812a3f3a92996bc5a0c922fd249",
          "status": 0,
          "ftl": null,
          "name": "mibh(4c9e)",
          "kind": "com.thenaran.rtos.m",
          "issuer": "com.thenaran.skec",
          "app_version": "0.1.18",
          "platform": "rtos",
          "model": "hubm",
          "locale": "locale",
          "system_version": "v4.0-dev-91-gb7b5c3a8c",
          "msg_token": "id/799b9f874bc1c50775233d2a0c00e388",
          "gadget_ids": [
            "2f7ce57203915d7c9505f71c8f4b1555"
          ],
          "latest_version": "0.1.20",
          "issuer": "com.thenaran.rtos.m",
          "beacons": [],
          "custom": {
            "x": 1111,
            "y": 2222
          },
          "tags": null
        }
      };
      this.services.setHubLocation(item)
      //this.marker.remove();
      //this.services.getGadget();
    },
    setWorker() {
      /*const beacons = getBeacons();
      console.log('beacons',beacons);*/
      const beacons = detectBeaconList("799b9f874bc1c50775233d2a0c00e388");
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
