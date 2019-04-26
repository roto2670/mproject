<template>
<div :id="id" v-if="isEmptyUrl" class="container">
</div>
</template>
<script>
import * as maptalks from 'maptalks'
import * as beaconDetector from '@/services/beacon-detector';
import util from '@/services/util';
import { EventBus } from "../main";
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
            ipcam: '',
            ipcams: [],
            contextCoordinate: null,
            contextMenu: null,
            bcns: {},
            options: {
                items: []
            },
            markerMap: {
                hubs: {},
                gadgets: {},
                cams: {}
            }
        }
    },
    methods: {
        initloadMap() {
            this.services.getMapFiles((url) => {
                // console.log(url)
                this.url = url
            })
            // Options
            // http://maptalks.org/maptalks.js/api/0.x/Map.html#options
            this.map = new maptalks.Map(this.id, {
                center: [90, 50],
                zoom: 6,
                maxZoom: 7,
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
                    //url: 'http://localhost:5000/static/dashboard/location/test/location',
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
            this.beaconDetector = new beaconDetector.BeaconDetector(this, (beacons) => {

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
            this.map.closeMenu();

            // Init EventHandler
            this.map.on('contextmenu', (e) => {
                this.contextCoordinate = e.coordinate;
                this.map.openMenu(e.coordinate);
            });
        },
        loadHubs() {
            console.debug('Try load hubs');
            let hubs = this.services.getHubs((hubList) => {
                console.log('Load hubs.', hubList);
                // Store hubs.
                this.$store.commit('addHubs', hubList); // TODO; move to services?

                // draw hub if has location data.
                this._.forEach(hubList, (hub) => {
                    let location = hub.custom && hub.custom.map_location;
                    if (!this._.isEmpty(location)) {
                        this.drawHub(hub.id, location);
                    }
                })
                this.hasSameGadget(hubList);
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
            this.services.getHubs((hubList) => {
                this.$store.commit('addHubs', hubList);
                // Clear old hub list view
                this.options.items = []; // TODO: destory for GC?

                if (!this._.isEmpty(hubList)) {
                    const geometry = new maptalks.Marker([this.contextCoordinate.x, this.contextCoordinate.y]).addTo(this.hubLayer);
                    geometry.hide();
                    this._.forEach(hubList, (hub, index) => {
                        if (!_.has(this.markerMap.hubs, hub.id)) {
                            // draw only no location hubs.
                            if (!!!hub.custom || !!!hub.custom.map_location) {
                                const itemObj = {
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
                            } else {
                                console.debug(`The ${hub.name} hub has location data. so skip`);
                            }
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
            if (this._.isArray(hubDataList)) {
                this._.forEach(hubDataList, function(hubData) {
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
                        markerFile: 'icon-hub.svg',
                        markerWidth: 50,
                        markerHeight: 50,
                    }
                }
            ).addTo(this.hubLayer);
            this.drawWorkers(hubId, coordinate); // 허브 추가 시 비콘들을 주위에 뿌린다.
            marker.on('click', () => {
                marker.updateSymbol({
                    markerFile: 'icon-hub-tab.svg'
                })
                this.showHubInfoWindow(hubId, marker);
            })
            this.markerMap.hubs[hubId] = marker;

            // Store hub location to server.
            this._updateHubLocation(hubId, coordinate.x, coordinate.y);
            this.startInterval(hubId);

            marker.on('dragend', (coordinate) => {
                console.log("location", coordinate);
                var str = document.getElementsByClassName('hub-move-button')[0].innerHTML;
                var text = str.replace("Move", "SetLocation");
                document.getElementsByClassName('hub-move-button')[0].innerHTML = text;

                document.getElementsByClassName('hub-move-button')[0].onclick = () => {
                    marker.closeInfoWindow();
                    marker.updateSymbol({
                        markerFile: 'icon-hub.svg'
                    })
                    marker.config('draggable', false);
                }
            })
        },
        removeHubMarker(hubId) {
            console.debug(`Try remove hub marker, id: ${hubId}`);

            let hubMarker = this.markerMap.hubs[hubId];
            if (!this._.isEmpty(hubMarker)) {
                // remove location in hub model
                let hub = this.$store.getters.getHub(hubId);
                if (!this._.isEmpty(hub)) {
                    delete hub.custom.map_location;
                    this.services.setHubLocation(hub);
                } else {
                    console.warn(`Failed to clear hub location, cannot found hub model by given id: ${hubId}`);
                }

                hubMarker.remove();
            } else {
                console.warn(`Failed to remove hub marker, cannot find marker by given id: ${hubId}`);
            }

            // remove children markers
            this.removeGadgetMakers(hubId);

            // delete in cahces
            delete this.markerMap.hubs[hubId];
        },
        removeGadgetMakers(hubId) {
            console.log(`Try remove hub markers for id: ${hubId}`);
            let gadgetMarkers = this.markerMap.gadgets[hubId];
            if (!this._.isEmpty(gadgetMarkers)) {
                this._.forEach(gadgetMarkers, (marker) => {
                    marker.remove();
                })
            } else {
                console.warn(`Failed to remove gadget markers by given id: ${hubId}`);
            }

            // clear in cache.
            delete this.markerMap.gadgets[hubId];
        },
        showHubInfoWindow(hubId, marker) {
            let context = '';
            let length = null;
            const gadgets = this.$store.getters.getGadgets(hubId);
            const hub = this.$store.getters.getHub(hubId);
            if (!this._.isEmpty(gadgets)) {
                this._.forEach(gadgets, (gadget) => {
                    context += `<li>${gadget.name}</li>`;
                })
                length += gadgets.length;
            } else {
                context += '<li>Theres no gadget to load</li>';
                length += 0;
            }
            marker.setInfoWindow({ // TODO: vue component
                content: '<ul class="worker_menu">' +
                    '<div class="worker"><div class="workerId"><div class="workerkey">SCANNER</div>' + hub.name + '</div>' +
                    '<div class="workerCount"><div class="workerkey">WORKER</div>' + length + '</div>' +
                    '<button class="hub-move-button">Move</button>' +
                    '<button class="hub-remove-button">Remove</button></div>' +
                    '<ul class="workerInfo">' +
                    context +
                    '</ul></ul>',
                'width': 350
            });
            marker.openInfoWindow();

            document.getElementsByClassName('hub-move-button')[0].onclick = () => {
                marker.config('draggable', true);
            }

            document.getElementsByClassName('hub-remove-button')[0].onclick = () => {
                this.removeHubMarker(hubId);
            } // TODO: suck

            document.getElementsByClassName('maptalks-close')[0].onclick = () => {
                marker.updateSymbol({
                    markerFile: 'icon-hub.svg'
                })
                marker.config('draggable', false);
            }

        },
        drawWorkers(hubId, coordinate) {
            this.services.getDetectBeaconList(hubId, (beacons) => {
                if (!this._.isEmpty(beacons)) {
                    this._.forEach(beacons, (beacon, index) => { //TODO getGadget(services.js) 하
                        this.services.getGadget(beacon.gid, (gadget) => {
                            if (!this.$store.getters.hasGadget(hubId, gadget.id)) {
                                this.$store.commit('addGadget', {
                                    hub_id: hubId,
                                    gadget: gadget
                                });
                            }
                        });
                        let marker = new maptalks.Marker(
                            [coordinate.x + (Math.random() * 6), coordinate.y + (Math.random() * 6)], {
                                'symbol': {
                                    'markerFile': 'icon-worker' + Math.ceil(Math.random() * 16) + '.svg',
                                    'markerWidth': 50,
                                    'markerHeight': 50
                                }
                            }
                        ).addTo(this.workerLayer);
                        marker.on('click', () => {
                            marker.updateSymbol({
                                markerFile: 'icon-worker' + Math.ceil(Math.random() * 16) + '-tab.svg'
                            })
                            this.showGadgetInFoWindow(hubId, beacon.gid, this.bcns[index]);
                        });
                        this.bcns[index] = marker;

                        // add in cache
                        let markerCache = this.markerMap.gadgets[hubId];
                        if (!!!markerCache) {
                            markerCache = [];
                            this.markerMap.gadgets[hubId] = markerCache;
                        }
                        markerCache.push(marker);
                    });
                } else {
                }
            }, () => {
                console.log("Failed to Get detBeacons List");
            });
        },
        showGadgetInFoWindow(hubId, gadgetId, marker) {
            let gadget = this.$store.getters.getGadget(hubId, gadgetId);
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

            document.getElementsByClassName('maptalks-close')[0].onclick = () => {
                marker.updateSymbol({
                    markerFile: 'icon-worker' + Math.ceil(Math.random() * 16) + '.svg'
                })
            }
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
                    '<div class="bcnsInfo"><div class="bcnskey">IPCAM</div></div>' +
                    '<img class="bcnsImg" src="item.png"></img>' +
                    '</div>',
                'width': 400
            });
            this.ipcam.openInfoWindow();
        },
        _updateHubLocation(hubId, x, y) {
            let hub = this.$store.getters.getHub(hubId);
            if (!!hub && !!x && !!y) {
                this._.extend(hub, {
                    custom: {
                        map_location: {
                            x: x,
                            y: y
                        }
                    }
                });
                // send to server.
                this.services.setHubLocation(hub);
            } else {
                console.warn('Failed to update hub location, given parms cannot be null.', hub, x, y);
            }
        },
        startInterval(hubId) {
            const CHECK_THRESOLD_TIME = 10000 * 1000;
            setInterval(() => {
                this.$store.commit('removeGadgets');
                const hub = this.$store.getters.getHub(hubId);
                this.removeGadgetMakers(hub.id);
                if (!_.isEmpty(hub.id)) {
                    this.drawWorkers(hub.id, hub.custom.map_location);
                } else {
                    console.warn(`There is no hub id, so we cannot update hub data`);
                }
            }, CHECK_THRESOLD_TIME)
        },
        setGadgetLocation(hubList) { // 중복된 가젯들이 들어있는 허브 리스트 목록 받아 위치 값 설정
            let hubLocation = {},
                gadgetLocation = {},
                x = 0,
                y = 0,
                gid = null;
            console.log("gadgggg", hubList);
            this._.forEach(hubList, (hub) => {
                const hub2 = this.$store.getters.getHub(hub.hid); //TODO: name change
                gid = hub.gid;
                if (!!hub2 && !this._.isEmpty(hub2.custom)) {
                    hubLocation[hub.hid] = hub2.custom.map_location;
                    hubLocation[hub.hid].dist = hub.dist;
                    // console.log("aqrr", hub.hid, this.$store.getters.getHub(hub.hid).custom.map_location);
                } else {
                    console.warn(`There is empty custom in hubid: ${hub.hid}`);
                }
            });
            this._.forEach(hubLocation, (hub) => {
                if (this.isNumber(hub.dist)) {
                    if (hub.dist < 0) {
                        hub.x = hub.x - (hub.x * (Math.abs(hub.dist) / 200));
                        hub.y = hub.y - (hub.y * (Math.abs(hub.dist) / 200));
                    } else {
                        hub.x = hub.x + (hub.x * (Math.abs(hub.dist) / 200));
                        hub.y = hub.y + (hub.y * (Math.abs(hub.dist) / 200));
                    }

                    x += hub.x;
                    y += hub.y;
                } else {
                    console.warn(`There is no dist data in hubId: ${hub.hid}`);
                }
            })
            this._.forEach(hubList, (hub) => {
                gadgetLocation = {
                    hid: hub.hid,
                    gid: gid,
                    x: x / this._.size(hubLocation),
                    y: y / this._.size(hubLocation)
                }
            })
            console.log("gadgetLocation", gadgetLocation);
            this.$store.commit('addGadgetLocation', gadgetLocation);
        },
        hasSameGadget(hubList) { // 비콘이 여러 허브에 들어있을 경우에 그 허브들의 리스트를 받아옴
            let gadgetList = [],
                sameGadgetList = [];
            this._.forEach(hubList, (hub, index) => {
                if (!this._.isEmpty(hub.beacons)) {
                    this._.forEach(hub.beacons, (beacon) => {
                        if (!!!gadgetList[beacon.uuid]) {
                            gadgetList[beacon.uuid] = [];
                        }
                        gadgetList[beacon.uuid].push(hub.id);
                        if (gadgetList[beacon.uuid].length > 1) {
                            sameGadgetList.push(beacon.uuid);
                        }
                    });
                }
            });
            console.log("sameGadgetList", sameGadgetList);

            this.services.getHubListConnectedToGadget("897d4536-ad17-eb35-7c12-6cfeef2b6c4b", (hubList) => {
                console.log("qrqrqrqr", hubList);
                if (!_.isEmpty(hubList)) {
                    this.setGadgetLocation(hubList.data);
                }
            })
            return true;
            // this._.forEach(sameGadgetList, (gadget) => {
            //     // this.services.getHubListConnectedToGadget(gadget, (hubList) => {
            //         this.setGadgetLocation(hubList.data);
            //     })
            // });
        }
    },
    computed: {
        isEmptyUrl() {
            return this._.isEmpty(this.mapUrl);
        }
    },
    created() {
        this.$emit('select-button');
        EventBus.$on('zoomIn', () => {
            this.map.zoomIn(7);
        });
        EventBus.$on('zoomOut', () => {
            this.map.zoomOut(6);
        });
    },
    mounted() {
        this.initloadMap();
    },
    mixins: [util]
}
</script>
<style>
#map {
    width: 100%;
    height: 100%;
    position: absolute;
    padding-top: 40px
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
    margin-top: 15px;
    box-shadow: 3px 3px 1px #aaaaaa;
}

.maptalks-menu {
    width: 100%;
    background: rgb(42 147 240) !important;
    border-radius: 10px;
    overflow: hidden;
    border: none !important;
}

.maptalks-menu .maptalks-menu-items {
    width: 100%;
    color: white !important;
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
    overflow: visible !important;
    border: none !important;
    border-radius: 10px !important;
    background: none !important;
}

.maptalks-msgBox a.maptalks-close {
    width: 30px !important;
    height: 30px !important;
    background-size: 30px !important;
    background-color: rgba(255, 87, 87, 1) !important;
    border-radius: 4px !important;
    z-index: 1;
    top: -20px !important;
}

.maptalks-msgBox a.maptalks-close:hover {
    background-color: rgb(93 130 166) !important;
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
    margin-block-start: 0px !important;
    margin-block-end: 0 !important;
    border-radius: 10px;
    overflow: hidden;
}

.workerInfo {
    height: 250px;
    width: 250px;
    margin-left: 100px;
    background-color: rgb(42 160 240);
    padding-inline-start: 0;
    overflow: scroll;
    border-top-right-radius: 10px;
}

.workerId {
    width: 80px;
    height: 80px;
    margin-left: 10px;
    margin-top: 30px;
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
    font-size: large;
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
    height: 250px;
    width: 100px;
    margin-right: 230px;
    position: absolute;
    background-color: rgb(57 178 255);
    border-bottom-left-radius: 10px;
    border-top-left-radius: 10px;
}

.bcnskey {
    font-size: 14px;
    padding-top: 20px;
    padding-left: 10px;
}

.hub-remove-button {
    color: #ffffff;
    background-color: #87CEEB;
    border: solid 1px #00BFFF;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    margin-top: 15px;
    border-radius: 15px
}

.hub-remove-button:hover {
    color: #ffffff;
    background-color: rgb(42 147 240);
    border: solid 1px #00BFFF;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    margin-top: 15px;
    border-radius: 15px
}

.hub-move-button {
    color: #ffffff;
    background-color: #87CEEB;
    border: solid 1px #00BFFF;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    margin-top: 20px;
    border-radius: 15px;
}

.hub-move-button:hover {
    color: #ffffff;
    background-color: rgb(42 147 240);
    border: solid 1px #00BFFF;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    margin-top: 20px;
    border-radius: 15px;
}

.bcnName {
    font-size: 20px;
    padding-top: 20px;
    padding-left: 10px;
}

.bcnsImg {
    height: 250px;
    width: 280px;
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
    background-color: rgb(93 224 219);
}

.exampleimg {
    height: 100%
}
</style>
