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
            modalLayer: '',
            ipcam: '',
            ipcams: [],
            contextCoordinate: null,
            infoWindow: null,
            selectFilteredBeacons: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                                    "11", "12", "13", "14", "15", "16"],
            bcns: {},
            bcnsData: {},
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
                        //url: url,
                        url: 'map.png',
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
                this.initBeaconLocationHandler();
                this.initContextMenu();
                this.loadHubs();
                this.setIpcam();
            });
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
            this.services.getProductId((productId) => {
                this.services.getBeacons(productId.product_id, (bcndata) => {
                    this.$store.commit('addDetectedGadget', bcndata);
                    this._loadHubs();
                })
            });
        },
        _loadHubs() {
           let hubs = this.services.getHubs((hubList) => {
                    console.log('Load hubs.', hubList);
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
                        markerFile: this.BASE_URI + 'icon-hub-tab.svg',
                        markerWidth: 50,
                        markerHeight: 50,
                    }
                }
            ).addTo(this.hubLayer);

            marker.on('click', () => {
                marker.updateSymbol({
                    markerFile: this.BASE_URI + 'icon-hub.svg'
                })
                this.showHubInfoWindow(hubId, marker);
            })
            this.markerMap.hubs[hubId] = marker;
            this._updateHubLocation(hubId, coordinate.x, coordinate.y);
            this.loadGadgets(hubId, () => {
                this.drawWorkers(hubId, coordinate);
                // Store hub location to server.
                this.startInterval(hubId);
                marker.on('dragstart draaging dragend', (e) => {
                    var str = document.getElementsByClassName('hub-move-button')[0].innerHTML;
                    var text = str.replace("Move", "SetLocation");
                    document.getElementsByClassName('hub-move-button')[0].innerHTML = text;

                    document.getElementsByClassName('hub-move-button')[0].onclick = () => {
                        marker.closeInfoWindow();
                        marker.updateSymbol({
                            markerFile: this.BASE_URI + 'icon-hub-tab.svg'
                        })
                        marker.config('draggable', false);
                        this.removeGadgetMarkersWhenHubIsMoved(hubId);
                        this._updateHubLocation(hubId, e.coordinate.x, e.coordinate.y);
                        this.loadGadgets(hubId, () => {
                            this.drawWorkers(hubId, marker._coordinates);
                        }), (err) => {
                            console.log("hub update is failed", err);
                        }
                    }
                })
            }, (err) => {
                console.log("load gadgets failed", err);
            });
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
                    this._loadHubs;
                } else {
                    console.warn(`Failed to clear hub location, cannot found hub model by given id: ${hubId}`);
                }
                hubMarker.remove();
            } else {
                console.warn(`Failed to remove hub marker, cannot find marker by given id: ${hubId}`);
            }

            // remove children markers
            this.removeGadgetMarkersWhenHubIsMoved(hubId);

            // delete in cahces
            delete this.markerMap.hubs[hubId];
        },
        removeGadgetMarkersWhenHubIsMoved(hubId) {
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
        removeGadgetMarker(marker) {
            if (!_.isEmpty(marker)) {
                marker.remove();
            }
        },
        showHubInfoWindow(hubId, marker) {
            let context = '',
                length = null,
                gadgetList = {};
            const gadgets = this.$store.getters.getBeaconWithHubs(hubId),
                  hub = this.$store.getters.getHub(hubId);
            if (!_.isEmpty(this.infoWindow)) {
               this.infoWindow.remove();
            }
            if (!this._.isEmpty(gadgets)) {
                this._.forEach(gadgets, (gadget) => {
                    if (!gadgetList[gadget.gid]) {
                        gadgetList[gadget.gid] = {};
                        var name = this.$store.getters.getdetectedGadgetName(gadget.gid);
                            context += `<li>${name}</li>`;
                    } else {

                    }
                    length = _.keys(gadgetList).length;
                })
            } else {
                context += '<li>Theres no hub to load</li>';
                length += 0;
            }
            marker.setInfoWindow({ // TODO: vue component
                content: '<ul class="worker_menu">' +
                    '<div class="worker">' +
                    '<div class="workerId">' +
                    '<div class="workerkey">SCANNER</div><div class="hubInfo">' + hub.name + '</div></div>' +
                    '<div class="workerCount"><div class="workerkey">WORKER</div>' + length + '</div>' +
                    '<div class="movebtn"><button class="hub-move-button">Move</button></div>' +
                    '<div class="removebtn"><button class="hub-remove-button">Remove</button></div>' +
                    '</div>' +
                    '<ul class="workerInfo">' + context + '</ul>' +
                    '</ul>',
                'width': 350
            });
            marker.openInfoWindow();

            document.getElementsByClassName('hub-move-button')[0].onclick = () => {
                marker.config('draggable', true);
            }

            document.getElementsByClassName('hub-remove-button')[0].onclick = () => {
                this.removeHubMarker(hubId);
            }

            document.getElementsByClassName('maptalks-close')[0].onclick = () => {
                marker.updateSymbol({
                    markerFile: this.BASE_URI + 'icon-hub-tab.svg'
                })
                marker.config('draggable', false);
            }

        },
        drawWorkers(hubId, coordinate) {
            let bcns = _.values(this.$store.getters.getdetectedGadgetList);
            this._.forEach(bcns, (beacon, index) => {
                let marker = null;
                if ((_.includes(beacon.hid, hubId)) && (!this._.isEmpty(beacon.custom))) {
                    if (beacon.view === 1) {
                        this.removeGadgetMarker(this.bcnsData[beacon.gid].marker, () => {});
                    }
                    marker = new maptalks.Marker(
                    [beacon.custom.x , beacon.custom.y], {
                    'symbol': {
                        'markerFile': this.BASE_URI + `icon-worker${beacon.tags}` + '-tab.svg',
                        'markerWidth': 50,
                        'markerHeight': 50
                        }
                    }
                    ).addTo(this.workerLayer);
                    marker.on('click', () => {
                        marker.updateSymbol({
                            markerFile: this.BASE_URI + `icon-worker${beacon.tags}` + '.svg'
                        })
                        this.showGadgetInFoWindow(hubId, beacon, this.bcns[index]);
                    });

                    this.$store.commit('GadgetIsInMap', beacon.gid);
                    this.bcns[index] = marker;
                    this.bcnsData[beacon.gid] = {
                        marker: marker,
                        tags: beacon.tags
                    };
                    // add in cache
                    let markerCache = this.markerMap.gadgets[hubId];
                    if (!!!markerCache) {
                        markerCache = [];
                        this.markerMap.gadgets[hubId] = markerCache;
                    }
                    markerCache.push(marker);
                } else if ((this._.includes(beacon.hid, hubId)) && (this._.isEmpty(beacon.custom))) {
                    if (beacon.view === 1) {
                       this.removeGadgetMarker(this.bcnsData[beacon.gid].marker, () => {});
                    }
                    marker = new maptalks.Marker(
                    [coordinate.x + index + 1.5, coordinate.y], {
                    'symbol': {
                        'markerFile': this.BASE_URI + 'icon-worker' + beacon.tags + '-tab.svg',
                        'markerWidth': 50,
                        'markerHeight': 50
                        }
                    }
                    ).addTo(this.workerLayer);
                    marker.on('click', () => {
                        marker.updateSymbol({
                            markerFile: this.BASE_URI + 'icon-worker' + beacon.tags + '.svg'
                        })
                        this.showGadgetInFoWindow(hubId, beacon, this.bcns[index]);
                    });

                    this.$store.commit('GadgetIsInMap', beacon.gid);
                    this.bcns[index] = marker;
                    this.bcnsData[beacon.gid] = {
                        marker: marker,
                        tags: beacon.tags
                    };
                    // add in cache
                    let markerCache = this.markerMap.gadgets[hubId];
                    if (!!!markerCache) {
                        markerCache = [];
                        this.markerMap.gadgets[hubId] = markerCache;
                    }
                    markerCache.push(marker);
                } else {
                    // console.log("bcns", beacon);
                }
            });
        },
        showGadgetInFoWindow(hubId, gadget, marker) {
            let gadgetInfo = {1: "JUMBO DRILL(2B)", 2: "JUMBO DRILL(3B)",
                              3: "CHARGING CAR", 4: "WHEEL LOADER", 5: "DUMP TRUCK",
                              6: "EXCAVATOR(WHEEL)", 7: "EXCAVATOR(CRAWLER)",
                              8: "SHOTCRETE MACHINE", 9: "JCB",
                              10: "CORE DRILLING MACHINE", 11: "DOZER",
                              12: "GROUTING MACHINE", 13: "MAI PUMP",
                              14: "MOBILE PRODUCTION UNIT",
                              15: "CHARGING PUMP UNIT", 16: "BUS"},
                gadgetName = gadgetInfo[this.bcnsData[gadget.gid].tags],
                hub = this.$store.getters.getHub(hubId);
            if (!_.isEmpty(this.infoWindow)) {
               this.infoWindow.remove();
            }

            marker.setInfoWindow({
                'content': '<div class="bcns">' +
                    '<div class="bcnsInfo1">' +
                    '<div class="bcnskey1">NAME</div>' +
                    '<div class="bcnName1">' + gadget.name + '</div>' +
                    '<div class="bcnskey1">KIND</div>' +
                    '<div class="bcnName1">' + gadgetName + '</div>' +
                    '<div class="scannerData">SCANNER</div>' +
                    '<div class="scannerName">' + hub.name + '</div>' +
                    '</div>' + '<img class="bcnsImg1" src=' + this.BASE_URI + '"item.png"></img>' +
                    '</div>',
                'width': 400,
                'bottom': 11
            });
            marker.openInfoWindow();

            document.getElementsByClassName('maptalks-close')[0].onclick = () => {
                marker.updateSymbol({
                    markerFile: this.BASE_URI + 'icon-worker' + gadget.tags + '-tab.svg'
                })
            }

            // TODO: ipcam info window
            // marker.setInfoWindow(
            //     'content': '<div class="bcns">' +
            //         '<div class="bcnsInfo2"><div class="bcnskey2">KIND</div>' +
            //         '<div class="bcnName2">' + gadgetName + '</div>' +
            //         '<div class="bcnNum2">' + gadget.tags + '</div>' +
            //         '</div>' + '<img class="bcnsImg2" src=' + this.BASE_URI + '"item.png"></img>' +
            //         '</div>',
            //     'width': 400,
            //     'bottom': 11
            // });
            // marker.openInfoWindow();

            // document.getElementsByClassName('maptalks-close')[0].onclick = () => {
            //     marker.updateSymbol({
            //         markerFile: this.BASE_URI + 'icon-worker' + gadget.tags + '-tab.svg'
            //     })
            // }

        },
        setIpcam() {
            return; // TODO: impl.
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
                    '<img class="bcnsImg" src=' + this.BASE_URI + '"item.png"></img>' +
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
                this.$store.commit('addHubLocation', hub);
                this.services.setHubLocation(hub);
                console.log("success to set hub location");
            } else {
                console.warn('Failed to update hub location, given parms cannot be null.', hub, x, y);
            }
        },
        startInterval(hubId) {
            const CHECK_THRESOLD_TIME = 10000 * 1000;
            setInterval(() => {
                this.$store.commit('removeGadgets');
                const hub = this.$store.getters.getHub(hubId);
                this.removeGadgetMarkersWhenHubIsMoved(hub.id);
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
            this._.forEach(hubList, (hub) => {
                const hubInfo = this.$store.getters.getHub(hub.hid); //TODO: name change
                gid = hub.gid;
                if (!!hubInfo && !this._.isEmpty(hubInfo.custom)) {
                    hubLocation[hub.hid] = hubInfo.custom.map_location;
                    hubLocation[hub.hid].dist = hub.dist;
                } else {
                    console.warn(`There is empty custom in hubid: ${hub.hid}`);
                }
            });

            this._.forEach(hubLocation, (hub, hubid) => {
                if (this.isNumber(hub.dist)) {
                    let datax = hub.x,
                        datay = hub.y;
                    datax = datax + (datax * (Math.abs(hub.dist) / 200));
                    datay = datay + (datay * (Math.abs(hub.dist) / 200));

                    x += datax;
                    y += datay;
                } else {
                    console.warn(`There is no dist data in hubId: ${hubid}`);
                }
            })
            if (!this._.isEmpty(hubLocation)) {
                this._.forEach(hubList, (hub) => {
                    this._.forEach(hub, (hubid) => {
                        gadgetLocation = {
                            hid: hubid,
                            gid: gid,
                            x: x / this._.size(hubLocation),
                            y: y / this._.size(hubLocation)
                        }
                    })
                })
                this.$store.commit('addGadgetLocation', gadgetLocation);
            }
        },
        hasSameGadget(successCallback) { // 비콘이 여러 허브에 들어있을 경우에 그 허브들의 리스트를 받아옴
            const gadgetData = this.$store.getters.getdetectedGadgetList;
            let sameGadgetList = {};
            this._.forEach(gadgetData, (hub, gadgetId) => {
                if (hub.hid.length > 1) {
                    sameGadgetList[gadgetId] = {};
                    sameGadgetList[gadgetId] = hub.hid;
                }
            })
            let sameGadgetListSize = _.keys(sameGadgetList).length;
            let gadgetCount = 1;

            console.log("sameGadgetList", sameGadgetList);
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
        setFilterdBeacons() {
            if (!_.isEmpty(this.selectFilteredBeacons)) {
                _.forEach(this.bcnsData, (bcn, gid) => {
                    if (!_.includes(this.selectFilteredBeacons, _.first(bcn.tags))) {
                        bcn.marker.hide();
                        this.$store.commit('GadgetIsnotInMap', gid);
                        console.log("Sucess to Hide selected Gadgets");
                    } else {
                        let gadgetList = this.$store.getters.getdetectedGadgetList;
                        if (gadgetList[gid].view === 0) {
                            bcn.marker.show();
                            this.$store.commit('GadgetIsInMap', gid);
                        }
                        console.log("Sucess to Show selected Gadgets");
                    }
                })
            } else {
                _.forEach(this.bcnsData, (bcn, gid) => {
                    bcn.marker.hide();
                })
            }
        },
        bgChangeWorkerTab(workerNum) {
            var str = document.getElementsByClassName('worker' + workerNum)[0].innerHTML,
                text = str.replace("icon-worker"+workerNum+".svg", "icon-worker"+workerNum+"-tab.svg");
            document.getElementsByClassName('worker' + workerNum)[0].innerHTML = text;

            if (!_.includes(this.selectFilteredBeacons, workerNum)) {
                this.selectFilteredBeacons.push(workerNum.toString());
            }

            document.getElementsByClassName('worker' + workerNum)[0].onclick = () => {
                this.bgChangeWorker(workerNum);
            }
            document.getElementsByClassName('done')[0].onclick = () => {
                this.infoWindow.remove();
                this.setFilterdBeacons();
            }
            console.log("111", this.selectFilteredBeacons);
        },
        bgChangeWorker (workerNum) {
            var str = document.getElementsByClassName('worker' + workerNum)[0].innerHTML,
                text = str.replace("icon-worker"+workerNum+"-tab.svg", "icon-worker"+workerNum+".svg");
            document.getElementsByClassName('worker' + workerNum)[0].innerHTML = text;

           _.forEach(this.selectFilteredBeacons, (bcn, index) => {
                if (bcn === workerNum.toString()) {
                    this.selectFilteredBeacons.splice(index, 1);
                }

            })
            // this.selectFilteredBeacons.splice(this.selectFilteredBeacons.indexOf(workerNum), 1);
            document.getElementsByClassName('worker' + workerNum)[0].onclick = () => {
                this.bgChangeWorkerTab(workerNum);
            }
            document.getElementsByClassName('done')[0].onclick = () => {
                this.infoWindow.remove();
                this.setFilterdBeacons();
            }
            console.log("222", this.selectFilteredBeacons);
        },
        filterBeacons() {
            let context = '<div class="filter_menu">',
                bcnNum = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                          "11", "12", "13", "14", "15", "16"];
            var coordinate = this.map.getCenter();
            if (this.selectFilteredBeacons.length != 16) {
                _.forEach(bcnNum, (index) => {
                    if (!_.includes(this.selectFilteredBeacons, index)) {
                       context += '<div class="beacon"><button class="worker' + index + '"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker' + index + '.svg"></button></div>';
                    } else {
                       context += '<div class="beacon"><button class="worker' + index + '"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker' + index + '-tab.svg"></button></div>';
                    }
                })
                context +='<button class="clickbtnreFilter" @click="refilter"></button>' +
                          '<button class="done"></button></div>';
                var filterBeacons = {
                        'width' : 870,
                        'height' : 250,
                        'content' : context
                    };
                this.infoWindow = new maptalks.ui.InfoWindow(filterBeacons);
                this.infoWindow.addTo(this.map).show(coordinate);
            } else {
                var filterBeacons = {
                    'width' : 870,
                    'height' : 250,
                    'autoPan' : false,
                    'autoCloseOn' : false,
                    'autoOpenOn' : false,
                    'content' : '<div class="filter_menu">' +
                    '<div class="beacon"><button class="worker1"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker1-tab.svg"></button></div>' +
                    '<div class="beacon"><button class="worker2"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker2-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker3"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker3-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker4"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker4-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker5"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker5-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker6"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker6-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker7"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker7-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker8"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker8-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker9"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker9-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker10"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker10-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker11"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker11-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker12"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker12-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker13"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker13-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker14"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker14-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker15"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker15-tab.svg"></button></button></div>' +
                    '<div class="beacon"><button class="worker16"><img class="workerImg" src=' + this.BASE_URI + '"icon-worker16-tab.svg"></button></button></div>' +
                    '<button class="clickbtnreFilter" @click="refilter"></button>' +
                    '<button class="done">OK</button></div>'
                };
                this.infoWindow = new maptalks.ui.InfoWindow(filterBeacons);
                this.infoWindow.addTo(this.map).show(coordinate);
            }

            document.getElementsByClassName('maptalks-close')[0].onclick = () => {
                this.refilterBeacons();
                this.infoWindow.remove();
            }

            document.getElementsByClassName('clickbtnreFilter')[0].onclick = () => {
                this.refilterBeacons();
                this.infoWindow.hide();
                this.infoWindow.remove();
            }

            document.getElementsByClassName('worker1')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "1")) {
                    this.bgChangeWorkerTab(1, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(1, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker2')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "2")) {
                    this.bgChangeWorkerTab(2, this.selectFilteredBeacons, () => {});
                } else{
                    this.bgChangeWorker(2, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker3')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "3")) {
                    this.bgChangeWorkerTab(3, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(3, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker4')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "4")) {
                    this.bgChangeWorkerTab(4, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(4, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker5')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "5")) {
                    this.bgChangeWorkerTab(5, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(5, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker6')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "6")) {
                    this.bgChangeWorkerTab(6, this.selectFilteredBeacons, () => {});
                } else{
                   this.bgChangeWorker(6, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker7')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "7")) {
                    this.bgChangeWorkerTab(7, this.selectFilteredBeacons, () => {});
                }
                this.bgChangeWorker(7, this.selectFilteredBeacons, () => {});
            }
            document.getElementsByClassName('worker8')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "8")) {
                    this.bgChangeWorkerTab(8, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(8, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker9')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "9")) {
                    this.bgChangeWorkerTab(9, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(9, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker10')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "10")) {
                    this.bgChangeWorkerTab(10, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(10, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker11')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "11")) {
                    this.bgChangeWorkerTab(11, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(11, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker12')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "12")) {
                    this.bgChangeWorkerTab(12, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(12, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker13')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "13")) {
                    this.bgChangeWorkerTab(13, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(13, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker14')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "14")) {
                    this.bgChangeWorkerTab(14, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(14, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker15')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "15")) {
                    this.bgChangeWorkerTab(15, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(15, this.selectFilteredBeacons, () => {});
                }
            }
            document.getElementsByClassName('worker16')[0].onclick = () => {
                if (!_.includes(this.selectFilteredBeacons, "16")) {
                    this.bgChangeWorkerTab(16, this.selectFilteredBeacons, () => {});
                } else {
                    this.bgChangeWorker(16, this.selectFilteredBeacons, () => {});
                }
            }
        },
        refilterBeacons() {
            this.selectFilteredBeacons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                                          "11", "12", "13", "14", "15", "16"];
            let detectedGadgetList = this.$store.getters.getdetectedGadgetList;
            _.forEach(detectedGadgetList, (detectedGadget) => {
                if (detectedGadget.view == 0) {
                    _.forEach(this.bcnsData, (bcn, gid) => {
                        if (gid === detectedGadget.gid) {
                            bcn.marker.show();
                            this.$store.commit('GadgetIsInMap', gid);
                        }
                    })
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
        }),
        EventBus.$on('refilter', () => {
            this.refilterBeacons();
        })
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

.filter_menu {
    width: 100%;
    background: rgb(42 147 240) !important;
    border-radius: 20%;
    overflow: hidden;
    border: none !important;
}

.clickbtnreFilter {
    border-radius: 50%;
    cursor: pointer;
    margin-top: 17%;
    position: absolute;
    margin-left: 42.5%;
    height: 35px;
    width: 35px;
    background-image: url('../../public/icon-alert-tab.svg');
}

.clickbtnreFilter:hover {
    box-shadow: 2px 2px 0.5px #aaaaaa;
}

.beacon {
    height: 50px;
    width: 60px;
    position: absolute;
}

.done {
    font-size: 15px;
    width: 40px;
    height: 40px;
    margin: 200px 0px 0px 370px;
    cursor: pointer;
    position: absolute;
    border-radius: 20%;
    background-color: #87CEEB;
    font-weight: 900;
    color: #333333;
}

.workerImg {
    width: 60px;
    height: 60px;
}

.worker1 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 50px 0px 0px 50px;
    padding: 0px;
    cursor: pointer;
    position: absolute;
}

.worker2 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 50px 0px 0px 140px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker3 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 50px 0px 0px 230px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker4 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 50px 0px 0px 320px;
    cursor: pointer;
    position: absolute;

    padding: 0px;
}

.worker5 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 50px 0px 0px 410px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker6 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 50px 0px 0px 500px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker7 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 50px 0px 0px 590px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker8 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 50px 0px 0px 680px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker9 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 140px 0px 0px 50px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker10 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 140px 0px 0px 140px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker11 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 140px 0px 0px 230px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker12 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 140px 0px 0px 320px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker13 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 140px 0px 0px 410px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker14 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 140px 0px 0px 500px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker15 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 140px 0px 0px 590px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
}

.worker16 {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 140px 0px 0px 680px;
    cursor: pointer;
    position: absolute;
    padding: 0px;
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
    background: rgb(57 178 255) !important;
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
    height: 240px;
    width: 200px;
    margin-left: 150px;
    background-color: white;
    padding-top: 10px;
    padding-inline-start: 0;
    overflow: scroll;
    border-top-right-radius: 10px;
}

.workerId {
    width: 100px;
    height: 50px;
    margin-left: 30px;
    margin-top: 30px;
    color: white;
    text-align: left;
    overflow: hidden;
    font-weight: 900;
    font-size: large
}

.workerCount {
    width: 80px;
    height: 40px;
    margin-left: 30px;
    color: white;
    text-align: left;
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
    text-align: left;
    font-size: 12px;
    margin-left: 13px;
    padding-top: 20px;
}

.scannerName {
    text-align: left;
    font-size: 16px;
    padding-top: 10px;
    padding-left: 12px;
    padding-right: 10px;
    word-break: break-all;
    font-weight: 900;
}

.bcnskey1 {
    text-align: left;
    font-size: 13px;
    margin-left: 13px;
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

.bcnNum1 {
    color: white;
    text-align: center;
    margin-left: 13px;
    margin-top: 60px;
    background-color: black;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 30px;
    font-weight: 200;
}

.bcnNum2 {
    font-weight: 200;
    font-size: 30px;
    color: rgb(93 224 219);
    margin-left: 90%;
    background-color: white;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    text-align: center;
    position: absolute;
    margin-top: 5.5%;
}

.bcnName1 {
    text-align: left;
    font-size: 16px;
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
    word-break: break-all;
    font-weight: 900;
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
