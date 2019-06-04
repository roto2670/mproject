<template>
<div :id="id" v-if="isEmptyUrl">
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
            url: '',
            zoomLv: '',
            layer: '',
            hubLayer: '',
            workerLayer: '',
            camLayer: '',
            ipcam: '',
            ipcams: [],
            contextCoordinate: null,
            infoWindow: null,
            selectFilteredBeaconsUpdateBefore: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                                    "11", "12", "13", "14", "15", "16"],
            selectFilteredBeaconsUpdateAfter: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                                    "11", "12", "13", "14", "15", "16"],
            bcns: {},
            bcnsData: {},
            hubsData: {},
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
                // Options
                // http://maptalks.org/maptalks.js/api/0.x/Map.html#options
                this.map = new maptalks.Map(this.id, {
                    center: [90, 50],
                    zoom: 6,
                    maxZoom: 9,
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
                        url: url,
                        // url: this.BASE_URI + 'map.png',
                        extent: [0, 0, 180, 85],
                        opactiy: 1
                    }], {
                        opactiy: 1
                    })
                });
                this.layer = new maptalks.VectorLayer('vector').addTo(this.map);
                this.hubLayer = new maptalks.VectorLayer('vector1').addTo(this.map);
                this.workerLayer = new maptalks.VectorLayer('vector2').addTo(this.map);
                this.camLayer = new maptalks.VectorLayer('vector3').addTo(this.map);
                this.hubLayer.setZIndex(3);
                this.workerLayer.setZIndex(1);
                this.initContextMenu();
                this.loadHubs();
                this.initBeaconLocationHandler();
                // TODO:
                //this.setIpcam();
            });
        },
        initBeaconLocationHandler(successCallback, failCallback) {
            // run beacon detector.
            this.beaconDetector = new beaconDetector.BeaconDetector(this, () => {
                let hubs = this.$store.getters.getHubsWhichIsInMap;

                if (!this._.isEmpty(this.infoWindow)) {
                    this.infoWindow.remove();
                }
                this.selectFilteredBeaconsUpdateAfter = this._.clone(this.selectFilteredBeaconsUpdateBefore);
                if (!_.isEmpty(hubs)) {
                    let hubData = {};
                    this._.forEach(hubs, (hub) => {
                        hubData[hub.id] = this.$store.getters.getHub(hub.id);
                        this.removeGadgetMarkersWhenHubIsMoved(hub.id); 
                    });
                    this.hasSameGadget(() => {
                        this._.forEach(hubData, (hub ,hubId) => {
                            this.drawWorkers(hubId, hub.custom.map_location);
                        });
                    }, (err) => {
                        failCallback(err);
                    });
                } else {
                    console.warn(`There is no hub id, so we cannot update hub data`);
                }
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
            // TODO: product id list?
            this.services.getInfo((info) => {
                this.services.getBeacons(info.product_id, (bcndata) => {
                    this.$store.commit('addDetectedGadget', bcndata);
                    this._loadHubs();
                })
            });
        },
        _loadHubs() {
           let hubs = this.services.getHubs((hubList) => {
                // Store hubs.
                this.$store.commit('addHubs', hubList); // TODO; move to services?

                // draw hub if has location data.
                const haslocationHubs = this.$store.getters.getHubs;
                this._.forEach(haslocationHubs, (hub) => {
                    if (!_.isEmpty(hub.custom)) {
                        this.drawHub(hub.id, hub.custom.map_location);
                    }
                });
            });
        },
        loadGadgets(hubId, successCallback, failCallback) {
            this.services.getDetectBeaconList(hubId, (beacons) => {
                this.$store.commit('addDetectedHubGadget', beacons);
                this.hasSameGadget(successCallback);
            }, (err) => {
                failCallback(err);
            });
        },
        handleAddHub(e) {
            // show hub List
            this.showhubList((selectedId) => {
                this.map.closeMenu(selectedId);
                // draw hub
                this.drawHub(selectedId, this.contextCoordinate);
            })
        },
        showhubList(selectedCallback) {
            this.map.closeMenu();
            // TODO
            this.services.getHubs((hubList) => {
                this.$store.commit('addHubs', hubList);
                // Clear old hub list view
                this.options.items = []; // TODO: destory for GC?
                if (!this._.isEmpty(hubList)) {
                    let geometry = new maptalks.Marker([this.contextCoordinate.x, this.contextCoordinate.y]).addTo(this.hubLayer);
                    geometry.hide();
                    this._.forEach(hubList, (hub, index) => {
                        if (!this._.has(this.markerMap.hubs, hub.id)) {
                            // draw only no location hubs.
                            if (!!!hub.custom || !!!hub.custom.map_location) {
                                let itemObj = {
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
                    if (this._.isEmpty(this.options.items)) {
                        let itemObj = {
                            item: "No Scanner",
                            click: () => {
                            }
                        }
                        this.options.items.push(itemObj);
                    }
                    geometry.setMenu(this.options).openMenu();
                } else {
                    let itemObj = {
                        item: "No Scanner to load"
                    }
                    this.options.items.push(itemObj);
                    geometry.setMenu(this.options).openMenu();
                }
            },
            function(error) {
                console.warn('Failed to load hub list.');
            });
        },
        /*
        hubDataList = {id: String, coordinate: Coordonate}
        */
        drawHub(hubId, coordinate) {
            console.debug('Try draw hub, id: ', hubId);
            let marker = null;
            this.zoomLv = 50 * (this.map.getZoom() / 8);
            marker = new maptalks.Marker(
                [coordinate.x, coordinate.y], {
                    'symbol': {
                        markerFile: this.BASE_URI + 'icon-hub-tab.svg',
                        markerWidth: this.zoomLv,
                        markerHeight: this.zoomLv,
                    },
                    'ZIndex': 3
                }
            ).addTo(this.hubLayer); 
            marker.on('click', () => {
                this.showHubInfoWindow(hubId, marker);
            })
            this.markerMap.hubs[hubId] = marker;
            this._updateHubLocation(hubId, coordinate.x, coordinate.y, () => {
                this.$store.commit('HubIsInMap', hubId);
                this.loadGadgets(hubId, () => {
                    this.drawWorkers(hubId, coordinate);
                    // Store hub location to server.
                    marker.on('dragstart draaging dragend', (e) => {
                        var str = document.getElementsByClassName('hub-move-button')[0].innerHTML;
                        var text = str.replace("Move", "SetLocation");
                        document.getElementsByClassName('hub-move-button')[0].innerHTML = text;
                        document.getElementsByClassName('hub-move-button')[0].onclick = () => {
                            marker.closeInfoWindow();
                            marker.config('draggable', false);
                            this.removeGadgetMarkersWhenHubIsMoved(hubId);
                            this._updateHubLocation(hubId, e.coordinate.x, e.coordinate.y, () => {
                                this.loadGadgets(hubId, () => {
                                    this.drawWorkers(hubId, marker._coordinates);
                                }), (err) => {
                                    console.log("hub update is failed", err);
                                }
                            });
                        }
                    })
                }, (err) => {
                    console.log("load gadgets failed", err);
                });
                this.map.on('zoomend', (e) => {
                    this.zoomLv = 50 * (this.map.getZoom() / 8);
                        marker.updateSymbol({
                            markerWidth : this.zoomLv,
                            markerHeight : this.zoomLv
                    })
                });
            });
        },
        removeHubMarker(hubId) {
            // console.debug(`Try remove hub marker, id: ${hubId}`);
            let hubMarker = this.markerMap.hubs[hubId];
            if (!this._.isEmpty(hubMarker)) {
                // remove location in hub model
                let hub = this.$store.getters.getHub(hubId);
                if (!this._.isEmpty(hub)) {
                    delete hub.custom.map_location;
                    this.services.setHubLocation(hub, this._.noop);
                    // this._loadHubs();
                    console.log("success to remove hubmarker");
                } else {
                    console.warn(`Failed to clear hub location, cannot found hub model by given id: ${hubId}`);
                }
                this.$store.commit('HubIsNotInMap', hubId);
                hubMarker.remove();
            } else {
                console.warn(`Failed to remove hub marker, cannot find marker by given id: ${hubId}`);
            }

            let hubList = this.$store.getters.getHubsWhichIsInMap,
                gadgetList = this.$store.getters.getdetectedGadgetList;

            // remove children markers

            this._.forEach(hubList, (hub) => {
                if (hub.view === window.CONSTANTS.HUB_VIEW.NOT_IN_MAP) {
                    this._.forEach(gadgetList, (gadget, gid) => {
                        if (this._.includes(gadget.hubIdList, hubId)) {
                            if (gadget.hubIdList.length > 1) {
                            } else {
                                gadget.view = window.CONSTANTS.HUB_VIEW.NOT_IN_MAP;
                                delete gadgetList[gid];
                                this.bcnsData[gid].marker.remove();
                                delete this.bcnsData[gid];
                            }
                            gadget.hubIdList = this._.without(gadget.hubIdList,hubId);
                        }
                    })
                }
            })
            // if (_.isEmpty(gadgetList)) {
            //     location.reload();
            // }
            this.hasSameGadget(() => {
                this._.forEach(hubList, (hub) => {
                    if (hub.view === window.CONSTANTS.HUB_VIEW.IN_MAP) {
                        this.drawWorkers(hub.id, this.markerMap.hubs[hub.id]._coordinates);
                    } 
                })
            });
            // delete in cahces
            delete this.markerMap.hubs[hubId];
        
        },
        removeGadgetMarkersWhenHubIsMoved(hubId) {
            // console.log(`Try remove hub markers for id: ${hubId}`);
            let gadgetMarkers = this.markerMap.gadgets[hubId];
            if (!this._.isEmpty(gadgetMarkers)) {
                this._.forEach(gadgetMarkers, (marker) => {
                    marker.remove();
                    this.markerMap.gadgets[hubId] = {};
                })
            } else {
                
            }

            // clear in cache.
            delete this.markerMap.gadgets[hubId];
        },
        showHubInfoWindow(hubId, marker) {
            let context = '',
                length = null,
                gadgetList = {};
            let gadgets = this.$store.getters.getBeaconWithHubs(hubId),
                hub = this.$store.getters.getHub(hubId);
            if (!this._.isEmpty(this.infoWindow)) {
               this.infoWindow.remove();
            }
            if (!this._.isEmpty(gadgets)) {
                this._.forEach(gadgets, (gadget) => {
                    if (!gadgetList[gadget.gid]) {
                        gadgetList[gadget.gid] = {};
                        var name = this.$store.getters.getdetectedGadgetName(gadget.gid);
                        if (name === 1) {
                            context += '<li id="' + gadget.gid + '">UNKNOWN</li>';
                        } else {
                            context += `<li id="` + gadget.gid + `">${name}</li>`;
                        }
                    } 
                    length = this._.keys(gadgetList).length;
                })
            } else {
                context += '<li>Theres no hub to load</li>';
                length += 0;
            }
            marker.setInfoWindow({ // TODO: vue component
                content: '<ul class="worker_menu">' +
                    '<div class="worker">' +
                    '<div class="workerId">' +
                    '<div class="workerkey">SCANNER</div><div class="hubInfo" title="' + hub.name + '">' + hub.name + '</div></div>' +
                    '<div class="workerCount"><div class="workerkey">WORKER</div>' + length + '</div>' +
                    '<div class="movebtn"><button class="hub-move-button">Move</button></div>' +
                    '<div class="removebtn"><button class="hub-remove-button">Remove</button></div>' +
                    '</div>' +
                    '<ul class="workerInfo">' + context + '</ul>' +
                    '</ul>',
                'width': 350
            });
            marker.openInfoWindow();

            this._.forEach(gadgets, (gadget) => {
                if (!this._.isEmpty(this.bcnsData[gadget.gid])) {
                    let gadgetData = this.$store.getters.getdetectedGadgetList[gadget.gid];
                    document.getElementById(gadget.gid).onclick = () => {
                        this.showGadgetInFoWindow(gadgetData, this.bcnsData[gadget.gid].marker);
                    }
                }
            })
            document.getElementsByClassName('hub-move-button')[0].onclick = () => {
                var str = document.getElementsByClassName('hub-move-button')[0].innerHTML;
                var text = str.replace("Move", "SetLocation");
                document.getElementsByClassName('hub-move-button')[0].innerHTML = text;
                marker.config('draggable', true);
            }

            document.getElementsByClassName('hub-remove-button')[0].onclick = () => {
                this.removeHubMarker(hubId);
            }

            document.getElementsByClassName('maptalks-close')[0].onclick = () => {
                // marker.updateSymbol({
                //     markerFile: this.BASE_URI + 'icon-hub-tab.svg'
                // })
                marker.config('draggable', false);
            }

        },
        drawWorkers(hubId, coordinate) {
            let bcns = this._.values(this.$store.getters.getdetectedGadgetList),
                count = 1;
            this.zoomLv = 50 * (this.map.getZoom() / 8);
            this._.forEach(bcns, (beacon, index) => {
                let marker = null,
                    customLocation = [];
                    
                if ((this._.includes(beacon.hubIdList, hubId))) { // 비콘에 위치정보가 있을시에 draw
                    if (!!this.bcnsData[beacon.gid] && beacon.view === window.CONSTANTS.HUB_VIEW.IN_MAP) {
                       this.bcnsData[beacon.gid].marker.remove();
                    }

                    if (this._.isEmpty(beacon.custom)) {
                        customLocation.push(coordinate.x, coordinate.y - (count / 10));
                    } else {
                        customLocation.push(beacon.custom.x , beacon.custom.y);
                    }

                    marker = new maptalks.Marker(
                    customLocation, {
                        'symbol': {
                            'markerFile': this.BASE_URI + `icon-worker${beacon.tags}` + '-tab.svg',
                            'markerWidth': this.zoomLv,
                            'markerHeight': this.zoomLv
                        }
                    }
                    ).addTo(this.workerLayer);
                    this.$store.commit('GadgetIsInMap', beacon.gid);
                    if (!this._.isEmpty(this.bcnsData[beacon.gid])) {
                        this.bcnsData[beacon.gid].marker = marker;
                    } else {
                        this.bcnsData[beacon.gid] = {
                            marker: marker,
                            tags: beacon.tags
                        };
                    }
                    if (!this._.includes(this.selectFilteredBeaconsUpdateBefore, this._.first(beacon.tags))) {
                        marker.hide();
                        this.$store.commit('GadgetIsnotInMap', beacon.gid);
                    }
                    if (_.isEmpty(beacon.tags)) {
                        marker.updateSymbol('markerFile', this.BASE_URI + 'icon-alert-tab.svg');
                    }
                    marker.on('click', () => {
                        this.showGadgetInFoWindow(beacon, this.bcnsData[beacon.gid].marker);
                    });
                    
                    // add in cache
                    let markerCache = this.markerMap.gadgets[hubId];
                    if (!!!markerCache) {
                        markerCache = [];
                        this.markerMap.gadgets[hubId] = markerCache;
                    }
                    this.map.on('zoomend', (e) => {
                        this.zoomLv = 50 * (this.map.getZoom() / 8);
                        marker.updateSymbol({
                            markerWidth : this.zoomLv,
                            markerHeight : this.zoomLv
                        })
                    });
                    marker.setZIndex(1);
                    markerCache.push(marker);
                    count++;
                } else {
                    // console.log("bcns", beacon);
                }
            });
        },
        showGadgetInFoWindow(gadget, marker) {
            let gadgetKind = window.CONSTANTS.GADGETINFO[this.bcnsData[gadget.gid].tags],
                hubList = this.$store.getters.getdetectedGadgetList[gadget.gid].hubIdList,
                hubName = null,
                gadgetImageURL = null,
                context = '';

            if (!this._.isEmpty(hubList)) {
                this._.forEach(hubList, (hub) => {
                    hubName = this.$store.getters.getHub(hub).name; 
                    context += '<div class="scannerName" title="' + hubName +'">' + hubName + '</div>' 
                })
                context += '</div>';
            }
            marker.setInfoWindow({
                'content': '<div class="bcns">' +
                    '<div class="bcnsInfo1">' +
                    '<div class="bcnskey1">NAME</div>' +
                    '<div class="bcnName1" title="'+ gadget.name +'">' + gadget.name + '</div>' +
                    '<div class="bcnskey1">KIND</div>' +
                    '<div class="bcnName1" title="' + gadgetKind +'">' + gadgetKind + '</div>' +
                    '<div class="scannerData">SCANNER</div>' +
                    '<div class="scannerNameList">' +
                    context +
                    // '</div>' + '<img class="bcnsImg1" src="' + this.BASE_URI + 'item.png"></img>' +
                    '</div><div class="loader"><div></div><div></div><div></div><div></div></div>' + '<img class="bcnsImg1" src="' + this.BASE_URI + 'item.png"></img>' +
                    '</div>',
                'width': 400,
                'bottom': 11
            });
            marker.openInfoWindow();
            this.services.getBeaconImg(gadget.gid, (url) => {
                let imgElement = document.getElementsByClassName('bcnsImg1');
                if (!!url && !this._.isEmpty(imgElement)) {
                  imgElement[0].src = url; 
                  document.getElementsByClassName('loader')[0].remove();
                } else {
                    document.getElementsByClassName('loader')[0].remove();
                }
            }, (err) => {})
        },
        setIpcam() {
            this.ipcam = new maptalks.Marker(
                [127.113049, 37.498568], {
                    'symbol': {
                        'markerFile': this.BASE_URI + 'icon-ipcam.svg',
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
                    '<img class="bcnsImg" src="' + this.BASE_URI + 'item.png"></img>' +
                    '</div>',
                'width': 400
            });
            this.ipcam.openInfoWindow();
        },
        _updateHubLocation(hubId, x, y, readyCallback) {
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
                this.$store.commit('addHubLocation', hub);
                this.services.setHubLocation(hub, readyCallback);
            } else {
                console.warn('Failed to update hub location, given parms cannot be null.', hub, x, y);
            }
        },
        setGadgetLocation(hubList) { // 중복된 가젯들이 들어있는 허브 리스트 목록 받아 위치 값 설정
            let hubLocation = {},
                gadgetLocation = {},
                x = 0,
                y = 0,
                gid = null;
            this._.forEach(hubList, (hub) => {
                // hub -> {'hid': '', 'gid': '', 'dist': '', '_t': ''}
                let hubInfo = this.$store.getters.getHub(hub.hid); //TODO: name change
                gid = hub.gid;
                if (!!hubInfo && !this._.isEmpty(hubInfo.custom)) {
                    hubLocation[hub.hid] = hubInfo.custom.map_location;
                    hubLocation[hub.hid].dist = hub.dist;
                } else {
                    // console.warn(`There is empty custom in hubid: ${hub.hid}`);
                }
            });
            
            this._.forEach(hubLocation, (hub, hubid) => {
                if (this.isNumber(hub.dist)) {
                    let datax = hub.x,
                        datay = hub.y;
                    datax = datax + (Math.abs(hub.dist) / 200);
                    datay = datay + (Math.abs(hub.dist) / 200);
                    x += datax;
                    y += datay;
                } else {
                    console.warn(`There is no dist data in hubId: ${hubid}`);
                }
            })
            
            if (!this._.isEmpty(hubLocation)) {
                this._.forEach(hubList, (hub) => {
                    // this._.forEach(hub, (hubid) => {
                        gadgetLocation = {
                            hid: hub.hid,
                            gid: hub.gid,
                            x: x / this._.size(hubLocation),
                            y: y / this._.size(hubLocation)
                        }
                    
                })
                this.$store.commit('addGadgetLocation', gadgetLocation);
            }
        },
        hasSameGadget(successCallback) { // 비콘이 여러 허브에 들어있을 경우에 그 허브들의 리스트를 받아옴
            const gadgetData = this.$store.getters.getdetectedGadgetList,
                  sameGadgetList = {};
            this._.forEach(gadgetData, (gadget, gadgetId) => {
                if (gadget.hubIdList.length > 1) {
                    sameGadgetList[gadgetId] = {};
                    sameGadgetList[gadgetId] = gadget.hubIdList;
                }
            })
            let sameGadgetListSize = this._.keys(sameGadgetList).length,
                gadgetCount = 1;
            if (sameGadgetListSize == 0) {
                successCallback();
            } else {
                this._.forEach(sameGadgetList, (gadget, gadgetid) => {
                     this.services.getHubListConnectedToGadget(gadgetid, (hubList) => {
                        this.setGadgetLocation(hubList.data);
                        if (sameGadgetListSize == gadgetCount) {
                            successCallback();
                        } else {
                            gadgetCount++;
                        }
                    })
                });
            }
        },
        refilterBeacons() {
            this.selectFilteredBeaconsUpdateAfter = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                                          "11", "12", "13", "14", "15", "16"];
            let detectedGadgetList = this.$store.getters.getdetectedGadgetList;
            this._.forEach(this.bcnsData, (bcn, gid) => {
                if (this._.includes(this.selectFilteredBeaconsUpdateAfter, this._.first(bcn.tags))) {
                    this.bcnsData[gid].marker.show();
                    this.$store.commit('GadgetIsInMap', gid);
                }
            })
            this.selectFilteredBeaconsUpdateBefore = this._.clone(this.selectFilteredBeaconsUpdateAfter);
        },
        setFilteredBeacons() {
            if (!this._.isEmpty(this.selectFilteredBeaconsUpdateAfter)) {
                this._.forEach(this.bcnsData, (bcn, gid) => {
                    if (!this._.includes(this.selectFilteredBeaconsUpdateAfter, this._.first(bcn.tags))) {
                        this.$store.commit('GadgetIsnotInMap', gid);
                        bcn.marker.hide();
                    } else {
                        this.$store.commit('GadgetIsInMap', gid);
                        bcn.marker.show();
                    }
                })
            } else {
                this._.forEach(this.bcnsData, (bcn, gid) => {
                    this.$store.commit('GadgetIsnotInMap', gid);
                    bcn.marker.hide();
                })
            }
            this.selectFilteredBeaconsUpdateBefore = this._.clone(this.selectFilteredBeaconsUpdateAfter);
        },
        bgChangeWorkerTab(workerNum) {
            var str = document.getElementById('worker' + workerNum).src,
                text = str.replace("icon-worker"+workerNum+".svg", "icon-worker"+workerNum+"-tab.svg");
            document.getElementById('worker' + workerNum).src = text;

            if (!this._.includes(this.selectFilteredBeaconsUpdateAfter, workerNum)) {
                this.selectFilteredBeaconsUpdateAfter.push(workerNum.toString());
            }
            document.getElementById('worker' + workerNum).onclick = () => {
                this.bgChangeWorker(workerNum);
            }
        },
        bgChangeWorker (workerNum) {
            var str = document.getElementById('worker' + workerNum).src,
                text = str.replace("icon-worker"+workerNum+"-tab.svg", "icon-worker"+workerNum+".svg");
            document.getElementById('worker' + workerNum).src = text;

            this._.forEach(this.selectFilteredBeaconsUpdateAfter, (bcn, index) => {
                if (bcn === workerNum.toString()) {
                    this.selectFilteredBeaconsUpdateAfter.splice(index, 1);
                }
            });
            document.getElementById('worker' + workerNum).onclick = () => {
                this.bgChangeWorkerTab(workerNum);
            }
        },
        filterBeacons() {
            let context = '<div class="filter_menu"><div>';
            var coordinate = this.map.getCenter(),
                filterBeacons = {};
            coordinate.y -= 3;
            if (this.selectFilteredBeaconsUpdateAfter.length != window.CONSTANTS.MINIMUM_NUMBER.FILTERED_BEACONS) {
                this._.forEach(window.CONSTANTS.BEACON_NUMBER, (index) => {
                    if (!this._.includes(this.selectFilteredBeaconsUpdateAfter, index)) {
                       context += '<img id="worker' + index + '" class="workerImg" src="' + this.BASE_URI + 'icon-worker' + index + '.svg">';
                    } else {
                       context += '<img id="worker' + index + '" class="workerImg" src="' + this.BASE_URI + 'icon-worker' + index + '-tab.svg">';
                    }
                })
            } else {
                this._.forEach(window.CONSTANTS.BEACON_NUMBER, (index) => {
                    context += '<img id="worker' + index + '" class="workerImg" src="' + this.BASE_URI + 'icon-worker' + index + '-tab.svg">';
                }) 
            }
            context += '</div>' +
                    '<div class="controlContainer">' +
                    '<button id="done" class="done">OK</button>'+
                    '<button id="reset" class="reset">Reset</button>' +
                    '</div>' +
                    '</div>';
            filterBeacons = {
                        'width' : 700,
                        'height' : 250,
                        'autoPan' : false,
                        'autoCloseOn' : false,
                        'autoOpenOn' : false,
                        'content' : context
            };
            this.infoWindow = new maptalks.ui.InfoWindow(filterBeacons);
            this.infoWindow.addTo(this.map).show(coordinate);

            document.getElementsByClassName('maptalks-close')[0].onclick = () => {
                this.refilterBeacons();
                this.infoWindow.remove();
            }

            document.getElementsByClassName('done')[0].onclick = () => {
                this.setFilteredBeacons();
                this.infoWindow.remove();
                this.selectFilteredBeaconsUpdateBefore = this._.clone(this.selectFilteredBeaconsUpdateAfter);
            }

            document.getElementsByClassName('reset')[0].onclick = () => {
                this.refilterBeacons();
                this.infoWindow.hide();
                this.infoWindow.remove();
            }

            this._.forEach(window.CONSTANTS.BEACON_NUMBER, (index) => {
                document.getElementById('worker' + index).onclick = () => {
                    if (!this._.includes(this.selectFilteredBeaconsUpdateAfter, index)) {
                        this.bgChangeWorkerTab(index, this.selectFilteredBeaconsUpdateAfter, () => {});
                    } else {
                        this.bgChangeWorker(index, this.selectFilteredBeaconsUpdateAfter, () => {});
                    }
                }
            })
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
        EventBus.$on('filter', () => {
            this.filterBeacons();
        })
    },
    mounted() {
        this.initloadMap();
    },
    mixins: [util]
}
</script>
<style>
html, body {
    overflow: hidden;
}
#map {
    width: 100%;
    height: 100%;
    /* TODO : position absolute? */
    position: absolute;
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

.loader {
    display: inline-block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin-left: 60%;
    margin-top: 24%;
    opacity: 0.6;
}
.loader div {
  position: absolute;
  top: 27px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #fff;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.loader div:nth-child(1) {
  left: 6px;
  animation: loader1 0.6s infinite;
}
.loader div:nth-child(2) {
  left: 6px;
  animation: loader2 0.6s infinite;
}
.loader div:nth-child(3) {
  left: 26px;
  animation: loader2 0.6s infinite;
}
.loader div:nth-child(4) {
  left: 45px;
  animation: loader3 0.6s infinite;
}
@keyframes loader1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes loader3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes loader2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(19px, 0);
  }
}


@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.filter_menu {
    width: 100%;
    background: rgb(42 147 240) !important;
    overflow: hidden;
    border: none !important;
    border-radius: 10px;
    padding: 10px;
}

.controlContainer {
    text-align: center;
}

.reset {
    font-size: 15px;
    width: 60px;
    height: 40px;
    cursor: pointer;
    border-radius: 15%;
    background-color: #e0696d;
    font-weight: 900;
    color: #333333;
    margin: 5px;
}

.done {
    font-size: 15px;
    width: 60px;
    height: 40px;
    cursor: pointer;
    border-radius: 15%;
    background-color: #87CEEB;
    font-weight: 900;
    color: #333333;
    margin: 5px;
}

.workerImg {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    margin: 13px;
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
    overflow: scroll !important;
    max-height: 190px !important;
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
    padding-left: 5px;
    font-size: 13px;
    line-height: 24px;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
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
    /* background: none !important;
    background: rgb(57 178 255) !important; */
}

.maptalks-msgBox a.maptalks-close {
    width: 30px !important;
    height: 30px !important;
    background-size: 30px !important;
    background-color: rgba(255, 87, 87, 1) !important;
    border-radius: 4px !important;
    z-index: -1;
    top: -25px !important;
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
    width: 200px;
    margin-left: 150px;
    background-color: white;
    padding-inline-start: 0;
    overflow: scroll;
    border-top-right-radius: 10px;
}

.workerId {
    width: 100px;
    height: 50px;
    margin-left: 20px;
    margin-top: 30px;
    color: white;
    text-align: center;
    overflow: hidden;
    font-weight: 900;
    font-size: large
}

.workerCount {
    width: 100px;
    height: 40px;
    margin-left: 20px;
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
    opacity: 0.5;
    font-size: 14px;
    line-height: 40px;
    width: 200px;
    height: 40px;
    font-weight: 900;
    list-style-type: none
}

.workerInfo li:hover {
    background: rgb(42 147 240);
    opacity: 0.6;
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
    width: 150px;
    margin-right: 230px;
    position: absolute;
    background-color: rgb(57 178 255);
    border-bottom-left-radius: 10px;
    border-top-left-radius: 10px;
}

.scannerData {
    text-align: center;
    font-size: 12px;
    padding-top: 20px;
}

.scannerNameList {
    height: 60px;
    overflow: scroll;
}

.scannerName {
    text-align: center;
    font-size: 16px;
    padding-top: 10px;
    padding-left: 12px;
    padding-right: 10px;
    font-weight: 900;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
}

.scannerName[title]:hover::after,
.scannerName[title]:focus::after {
    content: attr(title);
    position: absolute;
    transform: translate3d(-70%, 50%, 0);
    width: auto;
    white-space: nowrap;
    background: black;
    opacity: 0.7;
    color: #fff;
    border-radius: 2px;
    box-shadow: 1px 1px 5px 0 rgba(0,0,0,0.4);
    font-size: 14px;
    padding: 3px 5px;
    border-width: 0.5em 0 0.5em 0.5em;
    border-color: transparent transparent transparent white;
    -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
    filter: drop-shadow(1px 2px 1px #bcbcbc);
} 
.bcnskey1 {
    text-align: center;
    font-size: 13px;
    padding-top: 20px;
}

.bcnskey2 {
    font-size: 14px;
    padding-top: 10px;
    width: 100px;
    font-weight: 500;
    position: absolute;
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
    border-radius: 15px
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

.hubInfo {
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
}

.hubInfo[title]:hover::after,
.hubInfo[title]:focus::after {
    content: attr(title);
    position: absolute;
    transform: translate3d(-80%, 0, 0);
    z-index: 1;
    width: auto;
    white-space: nowrap;
    background: black;
    opacity: 0.7;;
    color: #fff;
    border-radius: 2px;
    box-shadow: 1px 1px 5px 0 rgba(0,0,0,0.4);
    font-size: 14px;
    padding: 3px 5px;
    border-width: 0.5em 0 0.5em 0.5em;
    border-color: transparent transparent transparent white;
    -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
    filter: drop-shadow(1px 2px 1px #bcbcbc);
} 

.bcnName1 {
    text-align: center;
    font-size: 16px;
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
    font-weight: 900;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
}


/* .bcnName1[title]:hover:before {
    content: attr(title);
    position: absolute;
      top: 60%;
      margin-top: 10px;
      padding: .55rem 1rem;
      font-size: 1rem;
      font-weight: 500;
      white-space: nowrap;
      color: #000;
      border-radius: 50px;
      background-color: #fff;
      box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1),
        0 5px 15px rgba(0, 0, 0, 0.07);

      pointer-events: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      opacity: 0;
      transition: all 0.2s ease-in-out;
} */

.bcnName1[title]:hover::after,
.bcnName1[title]:focus::after {
    content: attr(title);
    position: absolute;
    transform: translate3d(0, 50%, 0);
    width: auto;
    white-space: nowrap;
    background: black;
    opacity: 0.7;;
    color: #fff;
    border-radius: 2px;
    box-shadow: 1px 1px 5px 0 rgba(0,0,0,0.4);
    font-size: 14px;
    padding: 3px 5px;
    border-width: 0.5em 0 0.5em 0.5em;
    border-color: transparent transparent transparent white;
    -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
    filter: drop-shadow(1px 2px 1px #bcbcbc);
} 

.bcnName2 {
    text-align: left;
    font-size: 20px;
    width: 370px;
    height: 30px;
    margin-top: 25px;
    padding-top: 5px;
    margin-left: 30px;
    position: absolute;
}

.bcnsImg1 {
    height: 250px;
    width: 260px;
    margin-left: 140px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}

.bcnsImg2 {
    height: 250px;
    width: 400px;
    border-radius: 10px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}

.bcnsInfo1 {
    width: 140px;
    height: 250px;
    color: black;
    font-weight: bold;
    background-color: rgb(255, 181, 48);
    font-size: large;
    position: absolute;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
}

.bcnsInfo2 {
    margin-top: 190px;
    width: 400px;
    height: 60px;
    color: white;
    font-weight: bold;
    background-color: rgb(93, 224, 219);
    font-size: large;
    position: absolute;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

.ipcam-content {
    height: 200px
}

.ipcam {
    height: 60px;
    background-color: rgb(93 224 219);
}
</style>
