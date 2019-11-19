<template>
<div class="main-container">
    <div :id="id" v-if="isEmptyUrl">
    </div>
    <OnAir :isOnAir="onAir"></OnAir>
    <SpeakerInfoWindow :item="speakerInfoWindowItems" :isForGroup="false" v-if="isShowingInfoWindow" @select-close="handleInfoWindowClose"></SpeakerInfoWindow>
</div>
</template>

<script>
    import * as maptalks from 'maptalks'
    import * as beaconDetector from '@/services/beacon-detector';
    import SpeakerInfoWindow from '@/components/SpeakerInfoWindow';
    import OnAir from '@/components/OnAir';
    import util from '@/services/util';
    import { EventBus } from "../main";
    import { setTimeout, setInterval } from 'timers';
    import Hls from 'hls.js';
    export default {
        name: 'Map',
        props: {
            info: {
                type: Object,
                default: {}
            },
            isConnected: {
                type: Boolean,
                required: true
            }
        },
        data() {
            return {
                id: 'map',
                map: null,
                zoomLv: 15,  // Like 188Line
                markerWidth: {stops: [[4, 15], [5, 20], [6, 25], [7, 30]]},
                markerHeight: {stops: [[4, 15], [5, 20], [6, 25], [7, 30]]},
                url: '',
                toast: null,
                userStage: 0,
                hubPortalLayer: '',
                hubAT1Layer: '',
                hubAT2Layer: '',
                lostTagHubLayer: '',
                camFixedLayer: '',
                camMobileLayer: '',
                lostTagCamLayer: '',
                workerLayer: [],
                lostTagWorkerLayer: '',
                speakerLayer: [],
                noGroupSpeakerkLayer: '',
                speakerInfoWindowItems: null,
                alarmData: {},
                ipcam: '',
                ipcams: [],
                contextCoordinate: null,
                infoWindow: null,
                hubInfoWindow: null,
                ipcamInfoWindow: null,
                speakerInfoWindow: null,
                checkedMoiFilter: false,
                checkSpeakerFilter: false,
                setIntervalData: {},
                gadgetCount: {},
                gadgetInfoWindow: null,
                gadgetInfoNumber: this._.keys(window.CONSTANTS.GADGET_INFO),
                bcnsData: {},
                drawnGadgetList: {},
                isRemoveAll: false,
                ipcamStreamData: {},
                gadgetCountInfoWindow: null,
                onAir: false,
                markerMap: {
                    hubs: {},
                    cams: {},
                    speakers: {}
                },
                tags: {
                    xll: ['1', '2', '8'],
                    xl: ['3', '14', '15', '18', '19'],
                    l: ['4', '5', '6', '7', '9', '11']
                }
            }
        },
        components: {
            SpeakerInfoWindow,
            OnAir
        },
        methods: {
            initloadMap() {
                this.showLoading();
                this.services.getMapFile((url) => {
                    // Options
                    // http://maptalks.org/maptalks.js/api/0.x/Map.html#options
                    this.map = new maptalks.Map(this.id, {
                        // centerCross: true,
                        center: [90, 50],
                        zoom: 4,
                        maxZoom: 7,
                        minZoom: 4,
                        // Extent
                        // http://maptalks.org/maptalks.js/api/0.x/Extent.html
                        maxExtent: new maptalks.Extent(0, 0, 180, 80),
                        zoomAnimation: true,
                        zoomInCenter: false,
                        panAnimation: false,
                        dragRotate: false,
                        dragPitch: false,
                        drgaRotatePitch: false,
                        touchGesture: true,
                        touchZoom: true,
                        touchRotate: false,
                        touchPitch: false,
                        touchZoomRotate: false,
                        doubleClickZoom: false,
                        // Image Layer
                        // http://maptalks.org/maptalks.js/api/0.x/ImageLayer.html
                        baseLayer: new maptalks.ImageLayer("base", [{
                            url: url,
                            extent: [0, 0, 180, 80],
                            opactiy: 1
                        }], {
                            opactiy: 1
                        })
                    });
                    this.map.once('baselayerload', () => {
                        // this._.first(document.getElementsByClassName('loader')).remove();
                        this.hubPortalLayer = new maptalks.VectorLayer('vector21').addTo(this.map);
                        this.hubAT1Layer = new maptalks.VectorLayer('vector22').addTo(this.map);
                        this.hubAT2Layer = new maptalks.VectorLayer('vector23').addTo(this.map);
                        this.lostTagHubLayer = new maptalks.VectorLayer('vector28').addTo(this.map);
                        this._.forEach(this.gadgetInfoNumber, (index) => {
                            this.workerLayer[index] = new maptalks.VectorLayer(`vector${ index }`).addTo(this.map);
                            this.workerLayer[index].setZIndex(1);
                        })
                        this.lostTagWorkerLayer = new maptalks.VectorLayer('vector20').addTo(this.map);
                        this.lostTagWorkerLayer.setZIndex(1);
                        this.noGroupSpeakerkLayer = new maptalks.VectorLayer('speakerVector4').addTo(this.map);
                        this.hubPortalLayer.setZIndex(3);
                        this.hubAT1Layer.setZIndex(3);
                        this.hubAT2Layer.setZIndex(3);
                        this.lostTagHubLayer.setZIndex(3);
                        this.camFixedLayer = new maptalks.VectorLayer('vector25').addTo(this.map);
                        this.camMobileLayer = new maptalks.VectorLayer('vector26').addTo(this.map);
                        this.lostTagCamLayer = new maptalks.VectorLayer('vector27').addTo(this.map);
                        this.initContextMenu();
                        this.map.fitExtent();
                        this.loadItems(this.info);
                        //this.initBeaconLocationHandler(this.info);
                        this.hideLoading();
                    });
                    this.map.on('zoomend', (e) => {
                    });
                    this.map.on('click', (e) => {
                        this.speakerInfoWindowItems = {};
                    })
                });
            },
            setBaseZoomLv() {
                if (this.map.getZoom() == 4) {
                   this.zoomLv = 15;
                } else if (this.map.getZoom() == 5) {
                   this.zoomLv = 20;
                } else if (this.map.getZoom() == 6) {
                   this.zoomLv = 25;
                } else {
                   this.zoomLv = 30;
                }
            },
            initBeaconLocationHandler(info) {
                // run beacon detector.
                this.beaconDetector = new beaconDetector.BeaconDetector(this, info, () => {
                    // if (!!this.infoWindow) {
                    //     this.infoWindow.remove();
                    // }
                }, (err) => {
                    console.warn(`There's no data to update`);
                });
                this.startDetector();
            },
            initContextMenu() {
                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                    this.contextMenuOption = {
                        'custom': true,
                        'items': `<div class="custom_menu"><div class="plus-symbol"></div>
                            <div class="deviceText">Device</div><div class="addText">ADD</div>
                            <div class="additem">
                            <div id="scanneritem">Add SCANNER</div>
                            <div id="camitem">Add IPCAM</div>
                            <div id="speakeritem">Add SPEAKER</div></div></div>`,
                        dx: -75,
                        animation: 'fade'
                    };
                    this.map.on('contextmenu', (e) => {
                        this.contextCoordinate = e.coordinate;
                        // this.map.openMenu(e.coordinate);
                        this.map.closeMenu();
                        this.map.setMenu(this.contextMenuOption).openMenu(e.coordinate);

                        document.getElementById('scanneritem').onclick = () => {
                            this.handleAddItem('hub', e.coordinate);
                        }

                        document.getElementById('camitem').onclick = () => {
                            this.handleAddItem('ipcam', e.coordinate);
                        }

                        document.getElementById('speakeritem').onclick = () => {
                            this.handleAddItem('speaker', e.coordinate);
                        }
                    });
                }
            },
            handleAddItem(kind, coordinate) {
                this.showItemList(kind, coordinate, (id) => {
                    this.map.closeMenu(id);
                    let drawMethod = null;
                    if (kind === window.CONSTANTS.PRODUCT_KIND.HUB) {
                        drawMethod = this.drawHub;
                    } else if (kind === window.CONSTANTS.PRODUCT_KIND.IPCAM) {
                        drawMethod = this.drawIpcam;
                    } else if (kind === window.CONSTANTS.PRODUCT_KIND.SPEAKER)  {
                        drawMethod = this.drawSpeaker;
                    }
                    if (!!drawMethod) {
                        drawMethod(id, coordinate, false);
                    }
                });
            },
            showItemList(kind, coordinate, selectedCallback) {
                let list = null,
                    kindName = '',
                    markers = {};
                if (kind === window.CONSTANTS.PRODUCT_KIND.HUB) {
                    list = this.$store.getters.getHubs;
                    kindName = 'SCANNER';
                    markers = this.markerMap.hubs;
                } else if (kind === window.CONSTANTS.PRODUCT_KIND.IPCAM) {
                    list = this.$store.getters.getIpCams;
                    kindName = 'IPCAM';
                    markers = this.markerMap.cams;
                } else if (kind === window.CONSTANTS.PRODUCT_KIND.SPEAKER)  {
                    list = this.$store.getters.getSpeakers;
                    kindName = 'SPEAKER';
                    markers = this.markerMap.speakers;
                }
                const context = `<div class="custom_menu"><div class="plus-symbol"></div>
                                <div class="addText"${ kindName }</div>
                                <div class="additem"></div></div>`;
                this.map.setMenu({
                    'custom': true,
                    'items': context
                }).openMenu(coordinate);

                this._.forEach(list, (item, index) => {
                    if (!this._.has(markers, item.id)) {
                        let childElement = document.createElement('div');
                        childElement.id = `item${ index }`;
                        childElement.innerText = item.name;
                        childElement.onclick = () => {
                            selectedCallback(item.id);
                        }
                        document.getElementsByClassName("additem")[0].appendChild(childElement);
                    }
                });
                if (!!!document.getElementsByClassName("additem")[0].children.length) {
                    let childElement = document.createElement('div');
                    childElement.innerText = `No ${ kindName }`;
                    document.getElementsByClassName("additem")[0].appendChild(childElement);
                }
            },
            loadDetectedGadgets() {
                this.services.getDetectBeaconList((detectedLists) => {
                    this._.forEach(detectedLists, (list) => {
                        this._handleDetectedGadgets(list);
                    })

                    // this._.forEach(this.markerMap.hubs, (marker, hid) => { //TODO: 디텍트 된 비콘들의 개수를 허브 위치에 숫자로 표현 가능, overlap, 겹침
                    //     this.countGadgetOnHub(hid);
                    // })
                    console.log("Sucess to detect gadgets");
                });
            },
            countGadgetOnHub(hid) {
                let hubMarker = this.markerMap.hubs[hid],
                    dy = 0;
                const gadgets = this.$store.getters.getGadgetListDetectedByOneHub(hid);
                if (!!hubMarker) {
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        dy = 15;
                    } else {
                        dy = 25;
                    }
                    if (this._.size(gadgets) > 1) {
                        hubMarker.updateSymbol({
                            textName: this._.size(gadgets),
                            textWeight : 'bold',
                            textFill: '#fff',
                            textHaloFill : '#00BFFF',
                            textHaloRadius : 4,
                            textSize : 15,
                            textWrapCharacter : '\n',
                            textDy: dy
                        })
                    }
                }
            },
            loadItems(info) {
                this.services.getBeacons(info.product_id, (bcnData) => {
                    console.log("Success to get Beacons", bcnData);
                    this._.forEach(bcnData, (bcn) => {
                        this.$store.commit('addGadget', bcn);
                        if (this._.has(bcn.custom, 'ipcamId')) {
                            this.$store.commit('addIpcamIdAttachedOnBeacon', {ipcamId: bcn.custom.ipcamId, gid: bcn.id});
                        }
                    })
                    this.services.getHubs((hubList) => {
                        console.log("Success to get Hubs", hubList);
                        this._.forEach(hubList, (hub) => {
                            this.$store.commit('addHub', hub);
                            if (!this._.isEmpty(hub.custom) && !this._.isEmpty(hub.custom.map_location)) {
                                this.drawHub(hub.id, hub.custom.map_location, true);
                            }
                        });
                        this.loadDetectedGadgets();
                    });
                });
                this.services.getIpcams((ipcams) => {
                    console.log("Success to get Ipcams", ipcams);
                    this._.forEach(ipcams, ipcam => {
                        this.$store.commit('addIpcam', ipcam);
                    });
                    this.drawIpCams(ipcams, true);
                });

                // this.services.getGroupData(groups => { //TODO: group에 따른 speaker layer을 생성할 수 있게 함
                //     console.log("Sucess to get Groups", groups);
                //     this._.forEach(groups, group => {
                //         this.addGroupLayer(group.id);
                //         this.$store.commit('addGroup', group);
                //     })

                //     this.services.getSpeakers(speakers => {
                //         console.log("Sucesss to get Speakers", speakers);
                //         this._.forEach(speakers, speaker => {
                //             this.$store.commit('addSpeaker', speaker);
                //         })
                //         this.drawSpeakers(speakers);
                //     });
                // }, (error) => {
                //     console.log("Failed to get Groups", error);
                // });

                this.services.getSpeakers(speakers => {
                    console.log("Sucesss to get Speakers", speakers);
                    this._.forEach(speakers, speaker => {
                        this.$store.commit('addSpeaker', speaker);
                    })
                    this.drawSpeakers(speakers);
                });

                this.services.getAlarmList(alarms => {
                    console.log("Sucess to get Alarms", alarms);
                    this._.forEach(alarms, (alarm) => {
                        this.$store.commit('addAlarms', alarm);
                    })
                }, (error) => {
                    console.log("Failed to get Alarms", error);
                });
            },
            addGroupLayer(id) {
                if (!this._.has(this.speakerLayer, id)) {
                    this.speakerLayer[id] = new maptalks.VectorLayer(`speaker${ id }vector`).addTo(this.map);
                }
            },
            drawItems() {
                const hubs = this.$store.getters.getHubs,
                    ipcams = this.$store.getters.getIpCams;
                this.removeGadgetItems();
                const currentTime = new Date() / 1000.0;
                this._.forEach(this.markerMap.hubs, (hub, hid) => {
                    var list = this.$store.getters.getGadgetListDetectedByOneHub(hid);
                    this._.forEach(list, (item, gid) => {
                        if (currentTime - item._t < 15) {
                            this.$store.commit('removeDetectedGadgetWithHub', item);
                        }
                    });
                });
                this.hasSameGadget();
                this._.forEach(hubs, (hub) => {
                    if (!this._.isEmpty(hub.custom) && !this._.isEmpty(hub.custom.map_location)) {
                        this.drawHub(hub.id, hub.custom.map_location, true);
                        this.drawWorkers(hub.id, hub.custom.map_location);
                    }
                });
                if (!!this.hubInfoWindow) {
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        const content = this.getHubInfoWindowContent(this.hubInfoWindow.id),
                            infoPanel = document.getElementById('worker-info-panel');
                        if (!!infoPanel) {
                            infoPanel.innerHTML = content.context;
                            document.getElementById('worker-info-count').innerText = content.count;
                            this.registerGadgetHandlerInHubInfoWindow();
                        }
                    } else {
                        const content = this.getHubInfoWindowContent(this.hubInfoWindow.id),
                            infoPanel = document.getElementById('normal-worker-info-panel');
                        if (!!infoPanel) {
                            infoPanel.innerHTML = content.context;
                            this.registerGadgetHandlerInHubInfoWindow();
                        }
                    }
                }

                if (!!this.ipcamInfoWindow) { //name 변경된 경우
                    const content = this.getIpcamInfoWindowContent(this.ipcamInfoWindow.id),
                        ipcamContent = document.getElementById('ipcamContent');
                    if (!!ipcamContent) {
                        ipcamContent.innerHTML = content.content;
                    }
                }
                this.drawIpCams(ipcams, true);
            },
            handleInfoWindowClose() {
                this.speakerInfoWindowItems = {};
            },
            drawHub(hubId, coordinate, isUpdatedData) {
                let marker = null,
                    hubData = this.$store.getters.getHub(hubId),
                    draggable = null;

                if (this._.has(this.markerMap.hubs, hubId)) {
                    if (!(this.markerMap.hubs[hubId]._coordinates.x === coordinate.x) && !(this.markerMap.hubs[hubId]._coordinates.y === coordinate.y)) {
                        marker = this.markerMap.hubs[hubId];
                        marker.removeInfoWindow();
                        marker.setCoordinates(coordinate);
                        this.markerMap.hubs[hubId] = marker;
                    }
                } else {
                    this.drawnGadgetList[hubId] = [];
                    // this.setBaseZoomLv();
                    draggable = this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN) && !hubData.custom.lock;
                    let symbol = {
                        markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-hub-tab1.svg`,
                        markerWidth: this.markerWidth,
                        markerHeight: this.markerHeight
                    }
                    if (!this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        this._.extend(symbol, {
                            markerOpacity: 0
                        })
                    }
                    marker = new maptalks.Marker(
                        [coordinate.x, coordinate.y], {
                            'symbol': symbol,
                            draggable: draggable
                        }
                    )

                    let tagData = this._.first(hubData.tags);
                    if (window.CONSTANTS.IS_MOCK) {
                        tagData = parseInt(tagData) - 100;
                        tagData = tagData.toString();
                    }
                    if (tagData === "0") {
                        marker.addTo(this.hubPortalLayer);
                        this.markerMap.hubs[hubId] = marker;
                    } else if (tagData === "1") {
                        marker.addTo(this.hubAT1Layer);
                        this.markerMap.hubs[hubId] = marker;
                    } else if (tagData === "2") {
                        marker.addTo(this.hubAT2Layer);
                        this.markerMap.hubs[hubId] = marker;
                    } else {
                        marker.addTo(this.lostTagHubLayer);
                        this.markerMap.hubs[hubId] = marker;
                    }
                    // this.markerMap.hubs[hubId] = marker;

                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        if (!hubData.status) {
                            marker.updateSymbol({
                                markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-hub1.svg`
                            });
                        }
                        hubData.custom.map_location = {
                            x: coordinate.x,
                            y: coordinate.y
                        }
                        this.$store.commit('updateHubData', hubData);

                        if (!isUpdatedData) {
                            this._updateData([hubData], 'hub', (failedList) => {
                                if (!this._.isEmpty(failedList)) {
                                    this.sweetbox.fire('Sorry, Hub location update failed');
                                } else {
                                    this.$store.commit('updateHubData', hubData);
                                }
                            });
                        }

                        marker.on('click', () => {
                            this.showHubInfoWindow(hubId, marker);
                        });
                        marker.on('contextMenu', () => {
                            marker.closeInfoWindow();
                            this.showContextMenu(hubId, 0, marker);
                        });

                        marker.on('dragstart', () => {
                            marker.closeInfoWindow();
                            if (!!this.hubInfoWindow) {
                                this.hubInfoWindow = null;
                            }
                        });

                        marker.on('dragend', (e) => {
                            const hubMarkerLocation = this.markerMap.hubs[hubId]._coordinates;
                            hubData.custom.map_location = {
                                x: hubMarkerLocation.x,
                                y: hubMarkerLocation.y
                            }
                            this.$store.commit('updateHubData', hubData);
                            this.hasSameGadget();
                            this.drawWorkers(hubId, hubMarkerLocation);

                            if (!this._.has(this.setIntervalData, hubId)) {
                                this.setLocationTimeOut(hubId, 'hub');
                            }

                            if (!!marker._menuOptions) {
                                marker.closeMenu();
                            }
                        });

                        if (!this._.has(hubData.custom, "is_counted_hub")) {
                            hubData.custom.is_counted_hub = false;
                        } else {
                            if (hubData.custom.is_counted_hub) {
                                marker.updateSymbol({
                                    markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-hub-tab10.svg`
                                });
                            }
                        }
                    } else {
                        // marker.on('click', () => {       //TODO: 비콘리스트만 나오는 인포창 생성
                        //     this.showNormalHubInfoWindow(hubId, marker);
                        // });
                    }

                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_NORMAL)) {
                        marker.on('click', () => {
                            this.showHubInfoWindow(hubId, marker);
                        });
                    }
                }
            },
            setLocationTimeOut(id, kind) {
                this.setIntervalData[id] = setTimeout(() => {
                    let data = null,
                        marker = null;
                    if (kind === window.CONSTANTS.PRODUCT_KIND.HUB) {
                        data = this.$store.getters.getHub(id);
                        marker = this.markerMap.hubs[id];
                    } else if (kind === window.CONSTANTS.PRODUCT_KIND.IPCAM) {
                        data = this.$store.getters.getIpCam(id);
                        marker = this.markerMap.cams[id];
                    } else if (kind === window.CONSTANTS.PRODUCT_KIND.SPEAKER) {
                        data = this.$store.getters.getSpeaker(id);
                        marker = this.markerMap.speakers[id];
                    }
                    if (this._.has(data.custom, "map_location")) {
                        this._updateData([data], kind, (failedIdList) => {
                            delete this.setIntervalData[id];
                        });
                    }
                }, 3000);
            },
            removeHubMarker(hubId) {
                let hubMarker = this.markerMap.hubs[hubId],
                    gadgetList = this.$store.getters.getdetectedGadgetList;
                if (!this._.isEmpty(hubMarker)) {
                    let hub = this._.cloneDeep(this.$store.getters.getHub(hubId));
                    hubMarker.remove();
                    delete this.markerMap.hubs[hubId];
                    if (!this._.isEmpty(hub) && !!hub.custom.map_location) {
                        delete hub.custom.map_location;
                        delete hub.custom.is_counted_hub;
                        delete this.drawnGadgetList[hubId];
                        this._updateData([hub], 'hub', (failedIdList) => {
                            if (!this._.isEmpty(failedIdList)) {
                                this.sweetbox.fire('Sorry, Hub location update failed');
                            } else {
                                this.$store.commit('updateHubData', hub);
                                this.removeGadgetMarkersWhenHubIsMoved(hubId);
                            };
                        });
                        console.debug("success to remove hubmarker");
                    } else {
                        console.warn(`Failed to clear hub location, cannot found hub model by given id: ${ hubId }`);
                    }
                } else {
                    console.warn(`Failed to remove hub marker, cannot find marker by given id: ${ hubId }`);
                }
                this.hasSameGadget();
                this._.forEach(this.markerMap.hubs, (marker, hid) => {
                    this.drawnGadgetList[hid] = [];
                    this.drawWorkers(hid, this.markerMap.hubs[hid]._coordinates);
                })
            },
            showHubInfoWindow(hubId, marker) {
                let content = {},
                    length = 0,
                    toggle = '',
                    hubData = this.$store.getters.getHub(hubId);

                if(!this._.isEmpty(this.infoWindow)) {
                    this.infoWindow.remove();
                }
                if (!!this.hubInfoWindow) {
                    marker.removeInfoWindow();
                    this.hubInfoWindow = null;
                }
                if (hubData.custom.is_counted_hub) {
                    toggle = 'ON';
                } else {
                    toggle = 'OFF';
                }

                content = this.getHubInfoWindowContent(hubId);
                marker.setInfoWindow({ // TODO: vue component
                    content: `<div class="worker_menu">
                            <div class="worker">
                            <div class="workerId">${ content.updatedData }</div>
                            <div class="workerValue">
                            <div class="workerkey">WORKER</div><div class="workerCount" id="worker-info-count">${ content.count }</div></div>
                            <div class="forcount">For Counting</div>
                            <label class="moi-onoff-toggle-hub">
                            <input class="moi-toggle-button-hub" type="checkbox">
                            <span class="moi-toggle-slider-hub round-hub">${ toggle }</span>
                            </label>
                            <div class="worker-status"></div>
                            </div>
                            <div id="worker-info-panel" class="workerInfo">${ content.context }</div>
                            <div class="close-button-custom"></div></div></div>`,
                    width: 350,
                    custom: true,
                    autoPan: false,
                    dy: -15  // TODO:  before -300
                });
                marker.openInfoWindow();
                if (hubData.custom.lock) {
                    document.getElementsByClassName('worker-status')[0].classList.add('lock-img');
                } else {
                    document.getElementsByClassName('worker-status')[0].classList.add('unlock-img');
                }
                this.hubInfoWindow = {
                    id: hubId,
                    item: marker._infoWindow
                };
                document.getElementsByClassName('moi-toggle-button-hub')[0].checked = !!hubData.custom.is_counted_hub;
                document.getElementsByClassName('moi-toggle-button-hub')[0].disabled = !this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN);
                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                    document.getElementsByClassName('moi-toggle-button-hub')[0].onchange = () => {
                        hubData.custom.is_counted_hub = !!document.getElementsByClassName('moi-toggle-button-hub')[0].checked;
                        let fileUrl = `${window.CONSTANTS.URL.BASE_IMG}icon-hub-tab1.svg`;
                        document.getElementsByClassName('moi-toggle-slider-hub')[0].innerText = 'OFF';
                        if (hubData.custom.is_counted_hub) {
                            document.getElementsByClassName('moi-toggle-slider-hub')[0].innerText = 'ON';
                            fileUrl = `${window.CONSTANTS.URL.BASE_IMG}icon-hub-tab10.svg`;
                        }
                        let marker = this.markerMap.hubs[hubData.id];
                        if (!!marker) {
                            marker.updateSymbol({
                                markerFile: fileUrl
                            });
                        }
                        this._updateData([hub], 'hub', (failedIdList) => {
                            if (!this._.isEmpty(failedIdList)) {
                                this.sweetbox.fire('Sorry, Hub location update failed');
                            } else {
                                this.$store.commit('updateHubData', hubData);
                            }
                        });
                    }
                }
                this.registerGadgetHandlerInHubInfoWindow();

                this._.last(document.getElementsByClassName('close-button-custom')).onclick = () => {
                    marker.removeInfoWindow();
                }
                this.hubInfoWindow.item.on('remove', () => {
                    if (!!this.hubInfoWindow) {
                        this.hubInfoWindow = null;
                    }
                })
            },
            showNormalHubInfoWindow(hubId, marker) {
               let content = {},
                    length = 0,
                    toggle = '',
                    hubData = this.$store.getters.getHub(hubId);

                if(!this._.isEmpty(this.infoWindow)) {
                    this.infoWindow.remove();
                }
                if (!!this.hubInfoWindow) {
                    marker.removeInfoWindow();
                    this.hubInfoWindow = null;
                }

                content = this.getHubInfoWindowContent(hubId);
                marker.setInfoWindow({ // TODO: vue component
                    content: `<div class="worker_menu">
                            <div id="normal-worker-info-panel" class="normal-worker-info-panel">${ content.context }</div>
                            <div class="normal-close-button-custom"></div></div></div>`,
                    width: 350,
                    custom: true,
                    autoPan: false,
                    dy: -15  // TODO: before -300
                });
                marker.openInfoWindow();
                this.hubInfoWindow = {
                    id: hubId,
                    item: marker._infoWindow
                };

                this.registerGadgetHandlerInHubInfoWindow();

                this._.last(document.getElementsByClassName('normal-close-button-custom')).onclick = () => {
                    marker.removeInfoWindow();
                }
                this.hubInfoWindow.item.on('remove', () => {
                    if (!!this.hubInfoWindow) {
                        this.hubInfoWindow = null;
                    }
                })
            },
            startDetector(hid, marker) {
                if (!this.beaconDetector.isRunning()) {
                    this.beaconDetector.start();
                }
            },
            stopDetector() {
                if (this.beaconDetector.isRunning()) {
                    this.beaconDetector.stop();
                }
            },
            drawWorker(detectedData, coordinate) {
                let marker = null,
                    customLocation = [],
                    beacon = this.$store.getters.getDetectedGadget(detectedData.gid),
                    tag = 0,
                    size = {},
                    customLayer = null;
                if (!!!beacon) return;
                if (!!this._.isString(beacon.custom) || this._.isEmpty(beacon.custom.map_location)) {
                    //let number = Math.floor(Math.random())
                    let xPosition = Math.random() - 0.5,
                        yPosition = Math.random() - 1;
                    //customLocation.push(coordinate.x + number, coordinate.y - 3 * (1 / 10));
                    // customLocation.push(coordinate.x + xPosition, coordinate.y + (yPosition * (0.4)));
                    beacon.custom.map_location.x = coordinate.x + xPosition;
                    beacon.custom.map_location.y = coordinate.y + (yPosition * (0.4));
                    this.$store.commit('updateGadgetData', beacon);
                    customLocation.push(beacon.custom.map_location.x, beacon.custom.map_location.y);
                } else {
                    customLocation.push(beacon.custom.map_location.x, beacon.custom.map_location.y);
                }
                if (!!this.drawnGadgetList[detectedData.hid]) {
                    this.drawnGadgetList[detectedData.hid].push(detectedData.gid);
                }
                if (!!this.bcnsData[beacon.gid]) {
                    marker = this.bcnsData[beacon.gid].marker;
                    marker.removeInfoWindow();
                    this._setBeaconOpacity(marker, 600, 1);
                    marker.setCoordinates(customLocation);
                } else {
                    let markerImg = this._selectBeaconFileUrl(beacon.gid).fileUrl;
                    if (!this._.isEmpty(beacon.tags)) {
                        tag = this._.first(beacon.tags);
                        if (window.CONSTANTS.IS_MOCK) {
                            if (parseInt(tag) < 100) {
                               customLayer = this.lostTagWorkerLayer;
                            } else {
                                tag = parseInt(tag) - 100;
                                tag = tag.toString();
                                customLayer = this.workerLayer[tag];
                            }
                        } else {
                            if (tag >= 100) {
                                customLayer = this.lostTagWorkerLayer;
                            } else {
                                customLayer = this.workerLayer[tag];
                            }
                        }

                    } else {
                        customLayer = this.lostTagWorkerLayer;
                    }

                    size = this._getMarkerSize(tag);
                    let symbol = {
                        'markerFile': markerImg,
                        'markerWidth': size.width,
                        'markerHeight': size.height,
                        'markerOpacity': 0,
                        'markerDy': 10,
                        'markerLineWidth': 3
                    };

                    marker = new maptalks.Marker(
                        customLocation, {
                            'symbol': symbol
                        }
                    ).addTo(customLayer);

                    this._setBeaconOpacity(marker, 600, 1);
                    this.bcnsData[beacon.gid] = {
                        marker: marker,
                        tags: tag
                    };
                    marker.on('click', () => {
                        this.showGadgetInFoWindow(beacon, this.bcnsData[beacon.gid].marker);
                    });
                }
                if (!this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_NORMAL)) {
                    if (!marker.isVisible() && beacon.custom.is_visible_moi) {
                        marker.show();
                    } else if (marker.isVisible() && !beacon.custom.is_visible_moi) {
                        marker.hide();
                    }
                }
            },
            drawWorkers(hubId, coordinate) {
                let detectedList = this.$store.getters.getGadgetListDetectedByOneHub(hubId);
                this._.forEach(detectedList, (detectedData) => {
                    this.drawWorker(detectedData, coordinate);
                });
            },
            showGadgetInFoWindow(gadget, marker) {
                let gadgetKind = null,
                    gadgetList = this.$store.getters.getHubListDetectOneGadget(gadget.gid),
                    gadgetData = this.$store.getters.getDetectedGadget(gadget.gid),
                    hubIdList = this._.keys(gadgetList),
                    gadgetImageURL = null,
                    context = '',
                    cnt = 0,
                    tag = null;

                if (!!this.gadgetInfoWindow) {
                    if (!this._.isEqual(this.gadgetInfoWindow.id, gadget.gid)) {
                        this.gadgetInfoWindow.item.remove();
                    }
                }
                if (!this._.isEmpty(gadget.tags)) {
                    if (window.CONSTANTS.IS_MOCK) {
                        tag = parseInt(this._.first(gadget.tags)) - 100;
                        tag = tag.toString();
                        gadgetKind = window.CONSTANTS.GADGET_INFO[tag];
                    } else {
                        tag = this._.first(gadget.tags);
                        gadgetKind = window.CONSTANTS.GADGET_INFO[tag];
                    }
                }

                if (!this._.isEmpty(hubIdList)) {
                    this._.forEach(hubIdList, (hubId) => {
                        const hub = this.$store.getters.getHub(hubId);
                        if (!!hub && this._.has(hub.custom, 'map_location')) {
                            context += `<div class="scannerName" id="${ hub.id }-scanner" title="${ hub.name }">${ hub.name }</div>`;
                            cnt++;
                        }
                    })
                }
                // Origin -> scanner의 비콘갯수 및 리스트 안보이는 코드
                // let content = `<div class="bcns">
                //             <div class="bcnsInfo1">
                //             <div class="bcnskey1">NAME</div>
                //             <div class="bcnName1 bcnName" title="${ gadget.name }">${ gadget.name }</div>
                //             <div class="bcnskey1">KIND</div>
                //             <div class="bcnName1 bcnKind" title="${ gadgetKind }">${ !_.isEmpty(gadgetKind)? gadgetKind: 'Not Selected'}</div>
                //             <div id="${ gadget.gid }name-data" class="scannerData"></div>
                //             <div class="scannerNameList"></div></div>
                //             <div class="bcns-right-panel">
                //             <div id="${ gadget.gid }loading-panel" class="loading-panel"></div>
                //             <div id="${ gadget.gid }loader" class="loader"><div></div><div></div><div></div><div></div></div>
                //             <img id="${ gadget.gid }img" class="bcnsImg1" src="${ window.CONSTANTS.URL.BASE_IMG }item${ tag }.png"></img></div>
                //             <div class="close-button-custom"></div></div></div>`;
                // Origin -> scanner의 비콘갯수 및 리스트 보이는 코드
                let content = `<div class="bcns">
                            <div class="bcnsInfo1">
                            <div class="bcnskey1">NAME</div>
                            <div class="bcnName1 bcnName" title="${ gadget.name }">${ gadget.name }</div>
                            <div class="bcnskey1">KIND</div>
                            <div class="bcnName1 bcnKind" title="${ gadgetKind }">${ !_.isEmpty(gadgetKind)? gadgetKind: 'Not Selected'}</div>
                            <div id="${ gadget.gid }name-data" class="scannerData">SCANNER(${ cnt })</div>
                            <div class="scannerNameList">${ context }</div></div>
                            <div class="bcns-right-panel">
                            <div id="${ gadget.gid }loading-panel" class="loading-panel"></div>
                            <div id="${ gadget.gid }loader" class="loader"><div></div><div></div><div></div><div></div></div>
                            <img id="${ gadget.gid }img" class="bcnsImg1" src="${ window.CONSTANTS.URL.BASE_IMG }item${ tag }.png"></img></div>
                            <div class="close-button-custom"></div></div></div>`;
                let showInfoWindow = {
                    'content': content,
                    'width': 400,
                    'bottom': 11,
                    'custom': true,
                    // 'dy': -250,  before
                    'dy': -15,
                    'autoPan': false,
                    'autoCloseOn': true,
                    'autoOpenOn': true,
                }
                this.gadgetInfoWindow = {
                    id: gadget.gid,
                    item: new maptalks.ui.InfoWindow(showInfoWindow)
                };
                this.gadgetInfoWindow.item.addTo(this.map).show(this.map.getCenter());

                if (this._.has(gadgetData.custom, 'ipcamId')) { // TODO
                    const ipcamData = this.$store.getters.getIpCam(gadgetData.custom.ipcamId);
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_NORMAL) || ipcamData.custom.is_visible_moi) {
                        const playerId = 'video_player',
                            video = document.createElement('video'),
                            ipcamId = gadgetData.custom.ipcamId; // TODO
                            // ipcamId = "006-imockxxxxxxxxxxxxxxxxxxxxxxx";

                        this.gadgetInfoWindow.ipcamId = ipcamId;
                        video.setAttribute("id", playerId);
                        video.setAttribute("controls", "controls");
                        video.setAttribute("class", "gadget_mediaplayer");
                        const runtimePlayers = document.getElementsByClassName('bcns-right-panel')[0];
                        runtimePlayers.innerHTML = null;
                        runtimePlayers.appendChild(video);
                        this.openIpcamStreaming([ipcamId], (list) => {
                            let resObj = this._.first(list),
                                resData = resObj[ipcamId];
                            if (!!this.gadgetInfoWindow && this.gadgetInfoWindow.ipcamId === ipcamId) {
                                if (this._.isString(resData)) {
                                    this._playStreaming(resData, ipcamId);
                                } else {
                                    this.handleErrorStreaming(resData);
                                }
                            }
                        })
                    }
                }
                marker.setZIndex(4);
                // Blinking icon
                marker.flash(500, 5, () => {
                    marker.setZIndex(1);
                    // console.log("flash ended");
                });

                if (this._.isString(gadget.custom)) {
                    gadget.custom = {};
                }

                this._registerGadgetInfoWindowHandler(gadget);
                this.registerHubHandlerInGadgetInfoWindow();
            },
            removeGadgetMarkersWhenHubIsMoved(hubId) {
                const gadgetList = this.$store.getters.getGadgetListDetectedByOneHub(hubId);
                if (!this._.isEmpty(gadgetList)) {
                    this._.forEach(gadgetList, (data) => {
                        const gadget = this.$store.getters.getDetectedGadget(data.gid),
                            drawnHubIdList = this._.keys(this.markerMap.hubs),
                            restHubIdList = this._.intersection(drawnHubIdList, gadget.hubIdList);
                        if (restHubIdList.length <= 1) {
                            this.bcnsData[data.gid].marker.remove();
                            delete this.bcnsData[data.gid];
                            this.$store.commit('removeGadgetLocation', data.gid);
                        }
                    });
                }
            },
            removeGadget(gid) {
                if (this._.has(this.bcnsData, gid)) {
                    this.bcnsData[gid].marker.remove();
                    delete this.bcnsData[gid];
                    this._.forEach(this.markerMap.hubs, (marker, hid) => {
                        if (this._.includes(this.drawnGadgetList, gid)) {
                            this.drawnGadgetList[hubId] = this._.without(this.drawnGadgetList[hubId], gid);
                        }
                    })
                }
                this.$store.commit('removeGadget', gid);
            },
            setGadgetLocation(hubList) { // 중복된 가젯들이 들어있는 허브 리스트 목록 받아 위치 값 설정
                let hubLocation = {},
                    toCalc = {},
                    gadgetLocation = {},
                    x = 0,
                    y = 0,
                    distratio = 0,
                    first = null,
                    second = null,
                    cnt = 0,
                    calcnt = 0;
                hubLocation = this._.sortBy(hubList, ['_t']);
                hubLocation = this._.reverse(hubLocation);
                this._.forEach(hubLocation, (hub) => {
                    let hubData = this.$store.getters.getHub(hub.hid);
                    if (this._.has(hubData.custom, 'map_location')) {
                        if (calcnt < 2) {
                            toCalc[hub.hid] = this._.cloneDeep(hubData.custom.map_location);
                            toCalc[hub.hid].dist = hub.dist;
                            toCalc[hub.hid].gid = hub.gid;
                            calcnt++;
                        }
                    }
                })
                if (this._.size(toCalc) === 2) {
                    this._.forEach(toCalc, (hub, hubid) => {
                        if (cnt === 0) {
                            first = hub;
                        } else {
                            second = hub;
                        }
                        if (this.isNumber(hub.dist)) {
                            distratio += hub.dist;
                        }
                        cnt++;
                    })

                    x = (first.x * second.dist + second.x * first.dist) / distratio;
                    y = (first.y * second.dist + second.y * first.dist) / distratio;
                }

                if (!this._.isEqual(x, 0)) {
                    this._.forEach(toCalc, (hub, hid) => {
                        gadgetLocation = {
                            hid: hid,
                            gid: hub.gid,
                            x: x,
                            y: y,
                            zoomLv: 25 * (this.map.getZoom() / 11)
                        }
                    });
                    this.$store.commit('addGadgetLocation', gadgetLocation);
                }
            },
            hasSameGadget() { // 비콘이 여러 허브에 들어있을 경우에 그 허브들의 리스트를 받아옴
                const gadgetData = this.$store.getters.getdetectedGadgetList,
                    sameGadgetList = {},
                    drawnHubIdList = this._.keys(this.markerMap.hubs);
                this._.forEach(gadgetData, (gadget, gadgetId) => {
                    const restHubIdList = this._.intersection(drawnHubIdList, gadget.hubIdList);
                    if (restHubIdList.length > 1) {
                        sameGadgetList[gadgetId] = {};
                        sameGadgetList[gadgetId] = restHubIdList;
                    } else if (restHubIdList.length === 1) {
                        this.$store.commit('removeGadgetLocation', gadgetId);
                    }
                })
                let sameGadgetListSize = this._.keys(sameGadgetList).length,
                    gadgetCount = 1;
                if (sameGadgetListSize > 0) {
                    this._.forEach(sameGadgetList, (gadget, gadgetid) => {
                        const list = this.$store.getters.getHubListDetectOneGadget(gadgetid);
                        this.setGadgetLocation(list);
                    });
                }
            },
            drawIpCams(camList, isUpdatedData) {
                this._.forEach(camList, (ipcam) => {
                    if (!this._.isEmpty(ipcam.custom) && !this._.isEmpty(ipcam.custom.map_location)) {
                        this.drawIpcam(ipcam.id, ipcam.custom.map_location, isUpdatedData);
                    }
                });
            },
            drawIpcam(ipcamId, coordinate, isUpdatedData) {
                // console.debug('Try draw ipcam, id: ', ipcamId);
                let marker = null,
                    draggable = null,
                    customLayer = null;;
                var ipcamData = this.$store.getters.getIpCam(ipcamId);
                // this.setBaseZoomLv();

                if (this._.has(this.markerMap.cams, ipcamId)) {
                    if (!(this.markerMap.cams[ipcamId]._coordinates.x === coordinate.x) && !(this.markerMap.cams[ipcamId]._coordinates.y === coordinate.y)) {
                        marker = this.markerMap.cams[ipcamId];
                        if (!!this.ipcamInfoWindow) {
                            if (this._.isEqual(this.ipcamInfoWindow.id, ipcamId)) {
                                this._destroyStreaming(ipcamId);
                                marker.removeInfoWindow();
                                this.ipcamInfoWindow = null;
                            }
                        }
                        marker.setCoordinates(coordinate);
                        this.markerMap.cams[ipcamId] = marker;
                    }
                } else {
                    draggable = this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN) && !ipcamData.custom.lock;

                    const fileUrl = this._selectIpcamFileUrl(ipcamId).fileUrl;
                    let tagData = this._.first(ipcamData.tags);
                    if (window.CONSTANTS.IS_MOCK) {
                        tagData = parseInt(tagData) - 100;
                        tagData = tagData.toString();
                    }

                    if (tagData === "0") {
                        customLayer = this.camFixedLayer;
                    } else if (tagData === "1") {
                        customLayer = this.camMobileLayer;
                    } else {
                        customLayer = this.lostTagCamLayer;
                    }

                    marker = new maptalks.Marker(
                        [coordinate.x, coordinate.y], {
                            'symbol': {
                                markerFile: fileUrl,
                                markerWidth: this.markerWidth,
                                markerHeight: this.markerHeight
                            },
                            draggable: draggable
                        }
                    ).addTo(customLayer);

                    marker.on('click', () => {
                        marker.closeInfoWindow();
                        this.showIpcamWindow(ipcamId, marker);
                    });
                    this.markerMap.cams[ipcamId] = marker;
                    if (!this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_NORMAL)) {
                        if (!!ipcamData.custom && !ipcamData.custom.is_visible_moi) {
                            marker.hide();
                        }
                    } else {
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            marker.on('contextmenu', () => {
                                marker.closeInfoWindow();
                                this.showContextMenu(ipcamId, 1, marker);
                            });
                            marker.on('dragstart', () => {
                                marker.removeInfoWindow();
                                if (!!this.ipcamInfoWindow) {
                                    this.ipcamInfoWindow = null;
                                    this._destroyStreaming(ipcamId);
                                }
                            });
                            marker.on('dragend', (e) => {
                                const camMarkerLocation = this.markerMap.cams[ipcamId]._coordinates;
                                ipcamData.custom.map_location = {
                                    x: camMarkerLocation.x,
                                    y: camMarkerLocation.y
                                }
                                this.$store.commit('updateIpcamData', ipcamData);

                                if (!this._.has(this.setIntervalData, ipcamId)) {
                                    this.setLocationTimeOut(ipcamId, 'ipcam');
                                }
                                if (!!marker._menuOptions) {
                                    marker.closeMenu();
                                }
                            });
                            ipcamData.custom.map_location = {
                                x: coordinate.x,
                                y: coordinate.y
                            }
                            if (!this._.has(ipcamData.custom, 'is_visible_moi')) {
                                ipcamData.custom.is_visible_moi = false;
                            }
                            if (!isUpdatedData) {
                                this._updateData([ipcamData], 'ipcam',(failedList) => {
                                    if (!this._.isEmpty(failedList)) {
                                        this.sweetbox.fire('Sorry, Ipcam location update failed');
                                    }
                                    this.$store.commit('updateIpcamData', ipcamData);
                                });
                            }
                        }
                    }
                }
            },
            drawSpeakers(speakerList, isUpdatedData) {
                this._.forEach(speakerList, (speaker) => {
                    if (!this._.isEmpty(speaker.custom) && !this._.isEmpty(speaker.custom.map_location)) {
                        this.drawSpeaker(speaker.id, speaker.custom.map_location, isUpdatedData);
                    }
                });
            },
            drawSpeaker(speakerId, coordinate, isUpdatedData) {
                // console.debug('Try draw ipcam, id: ', ipcamId);
                let marker = null,
                    speakerData = this.$store.getters.getSpeaker(speakerId),
                    groupData = this.$store.getters.getGroupList;
                //TODO
                // this.setBaseZoomLv();
                let fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }speaker.svg`; // if changed, declare const
                if (!speakerData.status) {
                    fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }speaker-offline.png`;
                }

                if (this._.has(this.markerMap.speakers, speakerId)) {
                    if (!(this.markerMap.speakers[speakerId]._coordinates.x === coordinate.x) && !(this.markerMap.speakers[speakerId]._coordinates.y === coordinate.y)) {
                        marker = this.markerMap.speakers[speakerId];
                        marker.removeInfoWindow();
                        marker.setCoordinates(coordinate);
                        this.markerMap.speakers[speakerId] = marker;
                    }
                } else {
                    marker = new maptalks.Marker(
                        [coordinate.x, coordinate.y], {
                            'symbol': {
                                markerFile: fileUrl,
                                markerWidth: this.markerWidth,
                                markerHeight: this.markerHeight
                            },
                            draggable: this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)
                        }
                    )
                    let tagData = this._.first(speakerData.tags),
                    customLayer = null;
                    // console.log(`this.speaker${ tagData }Layer`);
                    if (!!tagData && this._.has(groupData, tagData)) {
                        customLayer = this.speakerLayer[tagData];
                    } else {
                        customLayer = this.noGroupSpeakerkLayer;
                    }
                    marker.addTo(customLayer);
                    marker.on('click', (e) => {
                        e.domEvent.stopPropagation();
                        this.speakerInfoWindowItems = speakerData;
                    });
                    this.markerMap.speakers[speakerId] = marker;
                    if (!this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_NORMAL)) {
                        if (!!speakerData.custom && !speakerData.custom.is_visible_moi) {
                            marker.hide();
                        }
                    } else {
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            marker.on('contextmenu', () => {
                                marker.closeInfoWindow();
                                this.showContextMenu(speakerId, 2, marker);
                            });
                            marker.on('dragstart', () => {
                                marker.closeInfoWindow();
                            });
                            marker.on('dragend', (e) => {
                                const speakerMarkerLocation = this.markerMap.speakers[speakerId]._coordinates;
                                speakerData.custom.map_location = {
                                    x: speakerMarkerLocation.x,
                                    y: speakerMarkerLocation.y
                                }
                                this.$store.commit('updateSpeakerData', speakerData);

                                if (!this._.has(this.setIntervalData, speakerId)) {
                                    this.setLocationTimeOut(speakerId, 'speaker');
                                }
                            });
                            speakerData.custom.map_location = {
                                x: coordinate.x,
                                y: coordinate.y
                            }
                            if (!isUpdatedData) {
                                this._updateData([speakerData], 'speaker', (failedList) => {
                                    if (!this._.isEmpty(failedList)) {
                                        this.sweetbox.fire('Sorry, speaker location update failed');
                                    }
                                    this.$store.commit('updateSpeakerData', speakerData);
                                });
                            }
                        }
                    }
                }
            },
            showIpcamWindow(ipcamId, marker) {
                let content = '',
                    ipcamData = this._.cloneDeep(this.$store.getters.getIpCam(ipcamId)),
                    name = null;
                if (!this._.isEmpty(this.infoWindow)) {
                    this.infoWindow.remove();
                }
                if (!!this.ipcamInfoWindow) {
                    if (!this._.isEqual(this.ipcamInfoWindow.id, ipcamId)) {
                        this._destroyStreaming(this.ipcamInfoWindow.id) ;
                        marker.removeInfoWindow();
                        this.ipcamInfoWindow = null;
                    }
                }

                marker.setInfoWindow({
                    'content': `<div class="ipcam_menu">
                        <div id="ipcam-main-container" class="ipcam-container">
                        <div class="ipcamId">
                        <div class="ipcamKey">IPCAM</div><div class="ipcamInfo" title="${ ipcamData.name }">${ ipcamData.name }</div></div>
                        </div><div class="ipcam-right-panel">
                        </div><div class="bottom-shape"></div><div class="close-button"></div></div>`,
                    custom: true,
                    dy: -15,  // TODO: before -333
                    dx: -4,
                    autoPan: false
                });
                marker.openInfoWindow();

                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                    let toggle = '';
                    if (ipcamData.custom.is_visible_moi) {
                        toggle = "ON";
                    } else {
                        toggle = "OFF";
                    }
                    const parentEl = document.getElementById('ipcam-main-container');
                    if (!!parentEl) {
                        const el = document.createElement('div');
                        el.innerHTML = `<div class="moi">MOI System</div>
                            <label class="moi-onoff-toggle-ipcam">
                            <input class="moi-toggle-button" type="checkbox">
                            <span class="moi-toggle-slider round">${ toggle }</span></label>
                            <div class="worker-status-ipcam"></div>`;
                        parentEl.append(el);
                        if (ipcamData.custom.lock) {
                            document.getElementsByClassName('worker-status-ipcam')[0].classList.add('lock-img');
                        } else {
                            document.getElementsByClassName('worker-status-ipcam')[0].classList.add('unlock-img');
                        }
                        document.getElementsByClassName('moi-toggle-button')[0].checked = ipcamData.custom.is_visible_moi;
                        document.getElementsByClassName('moi-toggle-button')[0].onchange = () => {
                            ipcamData.custom.is_visible_moi = document.getElementsByClassName('moi-toggle-button')[0].checked;
                            document.getElementsByClassName('moi-toggle-slider')[0].innerText = 'OFF';
                            if (ipcamData.custom.is_visible_moi) {
                                document.getElementsByClassName('moi-toggle-slider')[0].innerText = 'ON';
                            }
                            this.$store.commit('updateIpcamData', ipcamData);
                            this._updateIpcamData([ipcamData], (failedList) => {
                                if (!this._.isEmpty(failedList)) {
                                    if (this._.isEqual(this.ipcamInfoWindow.id, ipcamId)) {
                                        document.getElementsByClassName('moi-toggle-button')[0].checked = !ipcamData.custom.is_visible_moi;
                                    }
                                    ipcamData.custom.is_visible_moi = !ipcamData.custom.is_visible_moi;
                                    document.getElementsByClassName('moi-toggle-slider')[0].innerText = 'OFF';
                                    if (ipcamData.custom.is_visible_moi) {
                                        document.getElementsByClassName('moi-toggle-slider')[0].innerText = 'ON';
                                    }
                                    this.$store.commit('updateIpcamData', ipcamData);
                                }
                            });
                        }
                    }
                }
                const playerId = 'video_player',
                      video = document.createElement('video');
                video.setAttribute("id", playerId);
                video.setAttribute("controls", "controls");
                video.setAttribute("class", "mediaplayer");
                const runtimePlayers = document.getElementsByClassName('ipcam-right-panel')[0];
                runtimePlayers.appendChild(video);
                this.openIpcamStreaming([ipcamId], (list) => {
                    let resObj = this._.first(list),
                        resData = resObj[ipcamId];
                    if (!!this.ipcamInfoWindow && this.ipcamInfoWindow.id === ipcamId) {
                        if (this._.isString(resData)) {
                            this._playStreaming(resData, ipcamId);
                        } else {
                            this.handleErrorStreaming(resData);
                            this.closeIpcamStreaming([ipcamId], (res) => {
                                if (!this._.isEmpty(res)) {
                                    console.log("Close stream Failed");
                                } else {
                                    console.log("Close stream succedd");
                                }
                            });
                            marker.removeInfoWindow();
                        }
                    } else {
                        this.closeIpcamStreaming([ipcamId], (res) => {
                            if (!this._.isEmpty(res)) {
                                console.log("Close stream Failed");
                            } else {
                                console.log("Close stream succedd");
                            }
                        });
                    }
                });
                this.ipcamInfoWindow = {
                    id: ipcamId,
                    item: marker._infoWindow
                };

                this._.last(document.getElementsByClassName('close-button')).onclick = () => {
                    marker.removeInfoWindow();
                }

                this.ipcamInfoWindow.item.on('remove', () => {
                    if (!!this.ipcamInfoWindow) {
                        this._destroyStreaming(this.ipcamInfoWindow.id);
                        this.ipcamInfoWindow = null;
                    }
                });

            },
            openIpcamStreaming(ipcamId, resultCallback) {
                this.services.openIpcamStream(ipcamId, (url) => {
                    resultCallback(url);
                })
            },
            closeIpcamStreaming(ipcamId, resultCallback) {
                this.services.closeIpcamStream(ipcamId, (res) => {
                    resultCallback(res);
                })
            },
            handleErrorStreaming(errorCode) {
                switch(errorCode) {
                    case window.CONSTANTS.STREAMING_ERROR_CODE.IPCAM_DISCONNECT:
                        this.sweetbox.fire('Disconnected with this IPcam');
                    break;
                    case window.CONSTANTS.STREAMING_ERROR_CODE.STREAMING_FAILED:
                        this.sweetbox.fire('Failed to open IPcam streaming');
                    break;
                    case window.CONSTANTS.STREAMING_ERROR_CODE.STREAMING_SERVER_DISCONNECT:
                        this.sweetbox.fire('Disconnected with streaming server');
                    break;
                    case window.CONSTANTS.STREAMING_ERROR_CODE.LIMIT_STREAMING_ACCESS:
                        this.sweetbox.fire('Exceeded the number of users who can access the IPcam');
                    break;
                    case window.CONSTANTS.STREAMING_ERROR_CODE.UNKNOWN_IPCAMID:
                        this.sweetbox.fire('You sent unknown Ipcam Id');
                    break;
                }
            },
            removeIpcamMarker(ipcamId) {
                let ipcamMarker = this.markerMap.cams[ipcamId];
                if (!this._.isEmpty(ipcamMarker)) {
                    let ipcam = this._.cloneDeep(this.$store.getters.getIpCam(ipcamId));
                    ipcamMarker.remove();
                    delete this.markerMap.cams[ipcamId];
                    if (!this._.isEmpty(ipcam) && !!ipcam.custom.map_location) {
                        delete ipcam.custom.map_location;
                        delete ipcam.custom.is_visible_moi;
                        this.$store.commit('removeIpcamIdAttachedOnBeacon', ipcamId);
                        this._updateData([ipcam], 'ipcam', (failedIdList) => {
                            if (!this._.isEmpty(failedIdList)) {
                                this.sweetbox.fire('Sorry, Ipcam remove failed');
                            }
                        });
                    } else {
                        console.warn(`Failed to clear ipcam location, cannot found ipcam model by given id: ${ ipcamId }`);
                    }
                } else {
                    console.warn(`Failed to remove ipcam marker, cannot found ipcam by given id: ${ ipcamId }`);
                }
            },
            // showSpeakerWindow(id, marker) {
            //     let content = '',
            //         speaker = this.$store.getters.getSpeaker(id),
            //         name = null;
            //     if (!!this.speakerInfoWindowItem) {
            //         if (this.speakerInfoWindowItem.id === id) {
            //             marker.removeInfoWindow();
            //         }
            //     }
            //     // <div class="playContainer"><div class="play-button"></div><div class="pause-button"></div></div>
            //     marker.setInfoWindow({
            //         content: `<div class="top-speaker-container">
            //                     <div class="speaker-left-container">
            //                         <div class="speakerName">SPEAKER</div>
            //                         <div class="speaker-name" title="${ speaker.name }">${ speaker.name }</div>
            //                         <div class="custom-speaker-button">
            //                             <div class="mic-button"><div class="mic-button-title">WANRNING 1</div><div class="playContainer"></div></div>
            //                             <div class="mic-button"><div class="mic-button-title">WANRNING 2</div></div>
            //                             <div class="mic-button"><div class="mic-button-title">WANRNING 3</div></div>
            //                         </div>
            //                     </div>
            //                     <div class="speaker-right-container">
            //                     <div class="speaker-on-off"></div>
            //                     <img class="speakerImg" src="${ window.CONSTANTS.URL.BASE_IMG }construction-site.png"></img>
            //                     </div>
            //                     <div class="speaker-close-button"></div>
            //                 </div>`,
            //         custom: true,
            //         dy: -250,
            //         autoPan: false
            //     });
            //     marker.openInfoWindow();
            //     document.getElementsByClassName('mic-button-title')[0].onclick = () => {
            //         var restContainer = document.getElementsByClassName('playContainer')[0];
            //         if (!!restContainer.classList.length > 1) {
            //             restContainer.classList.remove('speaker-stop-button');
            //         } else if (!!restContainer.innerHTML) {
            //             restContainer.innerHTML = "";
            //         }

            //         this._checkAccessMicrophone((permissionState) => {
            //             if (permissionState === window.CONSTANTS.MICROPHONE_ACCESS_STATE.DENIED) {
            //                 console.log("Denied microphone access");
            //                 this.sweetbox.fire('Denied microphone access by system or user');
            //             } else {
            //                 this._requireAccess();
            //             }
            //         });
            //     }

            //     document.getElementsByClassName('speaker-close-button')[0].onclick = () => {
            //         marker.removeInfoWindow();
            //     }
            // },
            _checkAccessMicrophone(resultCallback) {
                navigator.permissions.query({
                    name: 'microphone'
                }).then(result => {
                    resultCallback(result.state);
                });
            },
            _requireAccess() {
                var playContainerContent = document.getElementsByClassName('playContainer')[0],
                    onoffClassList = document.getElementsByClassName('speaker-on-off')[0].classList,
                    content = `<div class="record-button"></div><div class="broadcast-button"></div>`;
                navigator.mediaDevices.getUserMedia({
                    audio: true
                }).then((stream) => {
                    // const context = new AudioContext(),
                    //       input = context.createMediaStreamSource(stream),
                    //       processor = context.createScriptProcessor(4096, 2, 2);
                    // input.connect(processor);
                    // // node.connect(context.destination);
                    // processor.onaudioprocess = function(e){
                    //     // Do something with the data, i.e Convert this to WAV
                    //     console.log(e.inputBuffer);
                    // };
                    // // node.connect(processor)
                    // const options = {mimeType: 'video/webm;codecs=vp9'};
                    const mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.ondataavailable = (e) => {
                        this._playRecordedData(e);
                    }
                    mediaRecorder.start();
                    playContainerContent.innerHTML = content;
                    document.getElementsByClassName('record-button')[0].onclick = () => {
                        var speakerStopButton = `<div class="speaker-stop-button"></div>`
                        playContainerContent.innerHTML = "";
                        playContainerContent.innerHTML = speakerStopButton;
                        onoffClassList.add('speaker-on');
                        document.getElementsByClassName('speaker-stop-button')[0].onclick = () => {
                            mediaRecorder.stop();
                            playContainerContent.innerHTML = "";
                            onoffClassList.remove('speaker-on');
                            onoffClassList.add('speaker-off');
                            setTimeout(() => {
                                onoffClassList.remove('speaker-off');
                            }, 3000);
                        }
                    }

                    document.getElementsByClassName('broadcast-button')[0].onclick = () => {
                        playContainerContent.innerHTML = "";
                    }

                    // console.log(processor);
                }).catch(e => console.log(e));
            },
            _playRecordedData(result) {
                const audioUrl = URL.createObjectURL(result.data),
                      audio = new Audio(audioUrl);
                var context = `<div class="play-button"></div>
                            <div class="pause-button"></div>
                            <div class="save-button"></div>`,
                    reader = new window.FileReader(),
                    base64data = '',
                    res = '';
                reader.readAsDataURL(result.data);
                reader.onloadend = (e) => {
                    base64data = reader.result,
                    res = base64data.split(',')[1];
                    // console.log("speaker res: ", res);
                }
                document.getElementsByClassName('playContainer')[0].innerHTML = context;

                document.getElementsByClassName('play-button')[0].onclick = () => {
                    audio.play();
                }

                document.getElementsByClassName('pause-button')[0].onclick = () => {
                    audio.pause();
                }

                document.getElementsByClassName('save-button')[0].onclick = () => {
                    this.sweetbox.fire('Success to save record');
                }
            },
            removeSpeakerMarker(id) {
                let marker = this.markerMap.speakers[id];
                if (!!marker) {
                    let speaker = this.$store.getters.getSpeaker(id);
                    marker.remove();
                    if (!!speaker && !!speaker.custom.map_location) {
                        delete speaker.custom.map_location;
                        delete speaker.custom.is_visible_moi;
                        delete this.markerMap.speakers[id];
                        //TODO: change
                        this.$store.commit('updateSpeakerData', speaker);
                        this._updateData([speaker], 'speaker', (failedIdList) => { //TODO
                            if (!this._.isEmpty(failedIdList)) {
                                this.sweetbox.fire('Sorry, speaker remove failed');
                            }
                        });
                    } else {
                        console.warn(`Failed to clear speaker location, cannot found speaker model by given id: ${ id }`);
                    }
                }
            },
            _updateData(data, kind, resultCallback) {
                this.services.updateData(data, kind, (failedIdList) => {
                    resultCallback(failedIdList);
                });
            },
            filterBeacon() {
                let context = '';
                this._.forEach(this.gadgetInfoNumber, (index) => {
                    context += `<label class="filterBeacon">
                                <img id="worker${ index }" class="workerImg" src="${ window.CONSTANTS.URL.BASE_IMG }icon-worker${ index }-tab.svg">
                                <input class="beaconItem" id="beacon-${ index }" type="checkbox" checked></label>`
                })
                context += `<button id="beacon-filter-Reset-Button" class="beacon-filter-Reset-Button">Reset</button>`;

                this.sweetbox.fire({
                    showCancelButton: false,
                    showConfirmButton: false,
                    showCloseButton: true,
                    titleText: 'Choose the beacon to filter',
                    html: context,
                    width: 550
                })

                this._.forEach(this.gadgetInfoNumber, (index) => {
                    document.getElementById(`beacon-${ index }`).checked = this.workerLayer[index].isVisible();
                    document.getElementById(`beacon-${ index }`).onchange = () => {
                        const checked = document.getElementById(`beacon-${ index }`).checked;
                        if (checked) {
                            this.workerLayer[index].show();
                        } else {
                            this.workerLayer[index].hide();
                        }
                    }
                })

                document.getElementById('beacon-filter-Reset-Button').onclick = () => {
                    this._.forEach(this.gadgetInfoNumber, (index) => {
                        document.getElementById(`beacon-${ index }`).checked = 0;
                        this.workerLayer[index].hide();
                    })
                }
            },
            choiceFilter() {
                this.sweetbox.fire({
                    titleText: 'Choose the item to filter',
                    html: `<button id="filterItemGadget" class="filterGadgetIcon"></button>
                    <div class="infoFilterGadget">Equipment</div>
                    <button id="filterItemHub" class="filterHubIcon"></button>
                    <div class="infoFilterHub">Beacon Scanner</div>
                    <button id="filterItemIpcam" class="filterIpcamIcon"></button>
                    <div class="infoFilterIpcam">IPCam</div>
                    <button id="filterItemSpeaker" class="filterSpeakerIcon"></button>
                    <div class="infoFilterSpeaker">Speaker</div>
                    <button id="filterItemMoi" class="filterMoiIcon"></button>
                    <div class="infoFilterMoi">MOI</div>`,
                    showCancelButton: false,
                    showConfirmButton: true,
                    confirmButtonColor: '#3085d6',
                    showCloseButton: true,
                    width: 550
                })
                if (this.checkedMoiFilter) {
                   document.getElementsByClassName('filterMoiIcon')[0].classList.add('moiFilter');
                }
                if (this.checkSpeakerFilter) {
                    document.getElementsByClassName('filterSpeakerIcon')[0].classList.add('speakerFilter');
                }
                document.getElementsByClassName('filterHubIcon')[0].onclick = () => {
                    this.filterItems(1);
                };
                document.getElementsByClassName('filterGadgetIcon')[0].onclick = () => {
                    this.filterBeacon();
                };

                document.getElementsByClassName('filterIpcamIcon')[0].onclick = () => {
                    this.filterItems(2);
                };
                document.getElementsByClassName('filterSpeakerIcon')[0].onclick = () => {
                    // this.filterItems(3);                                     //TODO: layer에 따른 filter를 가능하게 함
                    this.checkSpeakerFilter = !this.checkSpeakerFilter;         //TODO: 8줄 삭제
                    if (this.checkSpeakerFilter) {
                        this.noGroupSpeakerkLayer.hide();
                        document.getElementsByClassName('filterSpeakerIcon')[0].classList.add('speakerFilter');
                    } else {
                        this.noGroupSpeakerkLayer.show();
                        document.getElementsByClassName('filterSpeakerIcon')[0].classList.remove('speakerFilter');
                    }
                },
                document.getElementsByClassName('filterMoiIcon')[0].onclick = () => {
                    this.checkedMoiFilter = !this.checkedMoiFilter;
                    if (this.checkedMoiFilter) {
                        document.getElementsByClassName('filterMoiIcon')[0].classList.add('moiFilter');
                        this.userStage = window.CONSTANTS.USER_STAGE.SK_HQ;
                    } else {
                        document.getElementsByClassName('filterMoiIcon')[0].classList.remove('moiFilter');
                        this.userStage = this.info.stage;
                    }
                    this._showItemsByStage();
                }
            },
            filterItems(type) {
                let layers = {},
                    context = {},
                    content = '';
                if (type === 1) {
                    layers = {
                        firstOption: this.hubPortalLayer,
                        secondOption: this.hubAT1Layer,
                        thirdOption: this.hubAT2Layer
                    }
                    context = {
                        firstSelectOption: window.CONSTANTS.HUB_FILTER_TEXT.PORTAL,
                        secondSelectOption: window.CONSTANTS.HUB_FILTER_TEXT.AT1,
                        thirdSelectOption: window.CONSTANTS.HUB_FILTER_TEXT.AT2
                    }
                    content = `<div class="selectTn">
                            <label id="tn"><input class="firstSelectOption item${ type }-${ type }" type="checkbox" checked>
                            ${ context.firstSelectOption }</label></div>
                            <div class="selectTn">
                            <label id="tn"><input class="secondSelectOption item${ type }-${ type + 1 }" type="checkbox" checked>
                            ${ context.secondSelectOption }</label></div>
                            <div class="selectTn">
                            <label id="tn"><input class="thirdSelectOption item${ type }-${ type + 2 }" type="checkbox" checked>
                            ${ context.thirdSelectOption }</label></div>
                            <button id="filter-Reset-Button" class="filter-Reset-Button">Reset</button>`
                } else if (type === 2) {
                   layers = {
                        firstOption: this.camFixedLayer,
                        secondOption: this.camMobileLayer
                    }
                    context = {
                        firstSelectOption: window.CONSTANTS.IPCAM_FILTER_TEXT.FIXED,
                        secondSelectOption: window.CONSTANTS.IPCAM_FILTER_TEXT.MOBILE
                    }
                    content = `<div class="selectTn">
                            <label id="tn"><input class="firstSelectOption item${ type }-${ type }" type="checkbox" checked>
                            ${ context.firstSelectOption }</label></div>
                            <div class="selectTn">
                            <label id="tn"><input class="secondSelectOption item${ type }-${ type + 1 }" type="checkbox" checked>
                            ${ context.secondSelectOption }</label></div>
                            <button id="filter-Reset-Button" class="filter-Reset-Button">Reset</button>`
                } else if (type === 3) {
                    const groupData = this.$store.getters.getGroupList;
                    console.log("groupData", groupData);
                    content += '<div class="filter-content">';
                    this._.forEach(groupData, (group, index) => {
                        layers[index] = this.speakerLayer[group.id];
                        context = group.name;
                        content += `<div class="selectTn">
                            <label id="tn"><input class="firstSelectOption item${ type }-${ index }" type="checkbox" checked>
                            ${ group.name }</label></div>`;
                    })
                    content += `</div><button id="filter-Reset-Button" class="filter-Reset-Button">Reset</button>`;
                }
                this.sweetbox.mixin({
                    showConfirmButton: false,
                    showCloseButton: true,
                    showCancelButton: false
                }, onclose = () => {
                    document.getElementsByClassName('swal2-content')[0].classList.remove('filterItems');
                }).queue([{
                    title: 'Choose the Tunnel',
                    html: content
                }])

                if (type === 1 || type === 2) {
                    document.getElementById('filter-Reset-Button').onclick = () => {
                        document.getElementsByClassName(`item${ type }-${ type }`)[0].checked = 0;
                        document.getElementsByClassName(`item${ type }-${ type + 1 }`)[0].checked = 0;
                        layers.firstOption.hide();
                        layers.secondOption.hide();
                        if (!!document.getElementsByClassName(`item${ type }-${ type + 2 }`)[0]) {
                            document.getElementsByClassName(`item${ type }-${ type + 2 }`)[0].checked = 0;
                            layers.thirdOption.hide();
                        }
                    }
                    document.getElementsByClassName(`item${ type }-${ type }`)[0].checked = layers.firstOption.isVisible();
                    document.getElementsByClassName(`item${ type }-${ type }`)[0].onchange = () => {
                        const checked = document.getElementsByClassName(`item${ type }-${ type }`)[0].checked;
                        if (checked) {
                            layers.firstOption.show();
                        } else {
                            layers.firstOption.hide();
                        }
                    }
                    document.getElementsByClassName(`item${ type }-${ type + 1 }`)[0].checked = layers.secondOption.isVisible();
                    document.getElementsByClassName(`item${ type }-${ type + 1 }`)[0].onchange = () => {
                        const checked = document.getElementsByClassName(`item${ type }-${ type + 1 }`)[0].checked;
                        if (checked) {
                            layers.secondOption.show();
                        } else {
                            layers.secondOption.hide();
                        }
                    }
                    if (!!document.getElementsByClassName(`item${ type }-${ type + 2 }`)[0]) {
                        document.getElementsByClassName(`item${ type }-${ type + 2 }`)[0].checked = layers.thirdOption.isVisible();
                        document.getElementsByClassName(`item${ type }-${ type + 2}`)[0].onchange = () => {
                            const checked = document.getElementsByClassName(`item${ type }-${ type + 2 }`)[0].checked;
                            if (checked) {
                                layers.thirdOption.show();
                            } else {
                                layers.thirdOption.hide();
                            }
                        }
                    }
                } else {
                    const groupData = this.$store.getters.getGroupList;
                    this._.forEach(groupData, (group, index) => {
                        document.getElementsByClassName(`item${ type }-${ index }`)[0].checked = layers[index].isVisible();
                        document.getElementsByClassName(`item${ type }-${ index }`)[0].onchange = () => {
                            const checked = document.getElementsByClassName(`item${ type }-${ index }`)[0].checked;
                            if (checked) {
                                layers[index].show();
                            } else {
                                layers[index].hide();
                            }
                        }
                    })
                    document.getElementById('filter-Reset-Button').onclick = () => {
                       this._.forEach(groupData, (group, index) => {
                            document.getElementsByClassName(`item${ type }-${ index }`)[0].checked = 0;
                            layers[index].hide();
                       });
                    }
                }
                document.getElementsByClassName('swal2-content')[0].classList.add('filterItems');
            },
            showLoading() {
                this.$emit('map-load', true);
            },
            hideLoading() {
                this.$emit('map-load', false);
            },
            showContextMenu(id, type, marker) {
                let _type = '',
                    _name = '',
                    _removeMethod = null,
                    _lock = '';
                let data = null;
                switch (type) {
                    case window.CONSTANTS.CONTEXT_TYPE.SCANNER:
                        data = this.$store.getters.getHub(id);
                        _type = 'Scanner';
                        if (!!data) {
                            _name = data.name;
                        }
                        _removeMethod = this.removeHubMarker;
                        break;
                    case window.CONSTANTS.CONTEXT_TYPE.IPCAM:
                        data = this.$store.getters.getIpCam(id);
                        _type = 'IPCam';
                        if (!!data) {
                            _name = data.name;
                        }
                        _removeMethod = this.removeIpcamMarker;
                        break;
                    case window.CONSTANTS.CONTEXT_TYPE.SPEAKER:
                        data = this.$store.getters.getSpeaker(id);
                        _type = 'SPEAKER';
                        if (!!data) {
                            _name = data.name;
                        }
                        _removeMethod = this.removeSpeakerMarker;
                        break;
                }

                if (!data.custom.lock) {
                    _lock = 'Lock';
                } else {
                    _lock = 'Unlock';
                }
                marker.setMenu({
                    items: `<div class="context-menu-container ${ _type.toLowerCase() }">
                        <div class="context-menu-top-panel"><div class="context-menu-text-wrapper">
                        <div class="context-menu-type-text">${ _type }</div>
                        <div class="context-menu-name-text">${ _name }</div></div></div>
                        <div class="context-menu-bottom-panel">
                        <div id="move-button" class="context-menu-button-frame ${ _type.toLowerCase() }"><div class="context-menu-button-panel">
                        <div id="move-button-text" class="context-menu-button-text">${ _lock }</div></div></div>
                        <div id="remove-button" class="context-menu-button-frame ${ _type.toLowerCase() }"><div class="context-menu-button-panel">
                        <div id="remove-button-text" class="context-menu-button-text">${ 'Remove ' + _type.toLowerCase() }</div></div></div></div></div>`,
                    width: 350,
                    custom: true,
                    dy: -150,
                    animation: 'fade',
                    dx: -90
                }).openMenu();
                document.getElementById('move-button').onclick = () => {
                    data.custom.lock = !data.custom.lock;
                    marker.config('draggable', !data.custom.lock);
                    marker.closeMenu();
                    switch (type) {
                        case window.CONSTANTS.CONTEXT_TYPE.SCANNER:
                            this.$store.commit('updateHubData', data);
                            this._updateData([data], 'hub', (failedList) => {});
                        break;
                        case window.CONSTANTS.CONTEXT_TYPE.IPCAM:
                            this.$store.commit('updateIpcamData', data);
                            this._updateData([data], 'ipcam', (failedList) => {});
                        break;
                    }
                }
                document.getElementById('remove-button').onclick = () =>{
                    _removeMethod(id);
                    marker.closeMenu();
                }
            },
            removeItems() {
                this.sweetbox.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    width: 230,
                    showCloseButton: true,
                    showCancelButton: true,
                    reverseButtons: true,
                    cancelButtonColor: '#d33',
                }).then((res) => {
                    if (res.value) {
                        this.isRemoveAll = true;
                        this.removeHubItems();
                        this.removeGadgetItems();
                        this.removeIpcamItems();
                        this.removeSpeakerItems();
                        this.isRemoveAll = false;
                    }
                })
            },
            removeHubItems() {
                let hubList = [];
                this._.forEach(this.markerMap.hubs, (marker, hid) => {
                    let hub = this._.cloneDeep(this.$store.getters.getHub(hid));
                    if (!this._.isEmpty(hub)) {
                        delete hub.custom.map_location;
                        delete hub.custom.is_counted_hub;
                        this.$store.commit('updateHubData', hub);
                        this.markerMap.hubs[hid].remove();
                        delete this.markerMap.hubs[hid];
                        hubList.push(hub);
                    }
                });
                if (!!hubList) {
                    this._updateData(hubList, 'hub', (failedIdList) => {
                        console.debug("Succeed to remove hub data");
                    });
                }
            },
            removeGadgetItems() {
                if (this.bcnsData) {
                    this._.forEach(this.bcnsData, (bcn, gid) => {
                        bcn.marker.remove();
                        this.$store.commit('removeGadgetLocation', gid);
                    });
                }
                this.drawnGadgetList = {};
                this.bcnsData = {};
            },
            removeIpcamItems() {
                let ipcamList = [];
                this._.forEach(this.markerMap.cams, (marker, ipcamId) => {
                    let ipcam = this._.cloneDeep(this.$store.getters.getIpCam(ipcamId));
                    if (!this._.isEmpty(ipcam)) {
                        delete ipcam.custom.map_location;
                        delete ipcam.custom.is_visible_moi;
                        this.$store.commit('updateIpcamData', ipcam);
                        this.markerMap.cams[ipcamId].remove();
                        delete this.markerMap.cams[ipcamId];
                        ipcamList.push(ipcam);
                    }
                });
                if (!!ipcamList) {
                    this._updateData(ipcamList, 'ipcam', (failedIdList) => {
                        console.debug("Succeed to remove ipcam data");
                    })
                }
                this._.forEach(this.markerMap.cams, (marker, ipcamId) => {
                    this.removeIpcamMarker(ipcamId);
                });
            },
            removeSpeakerItems() {
                let speakerList = [];
                this._.forEach(this.markerMap.speakers, (marker, speakerId) => {
                    let speaker = this._.cloneDeep(this.$store.getters.getSepaker(speakerId));
                    if (!this._.isEMpty(speaker)) {
                        delete speaker.custom.map_location;
                        delete speaker.custom.is_visible_moi;
                        this.$store.commit('updateSpeakerData', speaker);
                        this.markerMap.speakers[speakerId].remove();
                        delete this.markerMap.spakers[speakerId];
                        speakerList.push(speaker);
                    }
                });
                if (!!speakerList) {
                    this._updateData(speakerList, 'speaker', (failedIdList) => {
                        console.debug("Succedd to remove speaker data");
                    })

                    this._.forEach(this.markerMap.speakers, (marker, speakerId) => {
                        this.removeSpeakerMarker(speakerId);
                    })
                }
            },
            getHubInfoWindowContent(hubId) {
                const gadgets = this.$store.getters.getGadgetListDetectedByOneHub(hubId),
                    hubData = this.$store.getters.getHub(hubId);
                let updatedContents = '',
                    content = '',
                    gadgetCount = 0;
                updatedContents += `<div class="workerkey">SCANNER</div><div class="hubInfo" title="${ hubData.name }">${ hubData.name }</div>`
                this._.forEach(gadgets, gadget => {
                    if (this._.includes(this.drawnGadgetList[hubId], gadget.gid)) {
                        var name = this.$store.getters.getdetectedGadgetName(gadget.gid);
                        if (!!name) {
                            const time = new Date(gadget._t * 1000).toLocaleTimeString('eu');
                            content += `<div class="workerInfo-content" id="${ gadget.gid }">
                                        <div class="workerInfo-wrapper">
                                        <div class="workerInfo-name" id="${ gadget.gid }-detectedBeaconName">${ name }</div>
                                        <span class="workerInfo-time" id="${ gadget.gid}-detectedBeaconTime">Today ${ time }</span></div></div>`;
                            gadgetCount++;
                        }
                    }
                });
                if (gadgetCount < 1) {
                    content = '<div class="workerInfo-empty">Theres no beacon</div>';
                }
                return {
                    updatedData: updatedContents,
                    context: content,
                    count: gadgetCount
                };
            },
            registerGadgetHandlerInHubInfoWindow() {
                if (!!this.hubInfoWindow) {
                    const gadgets = this.$store.getters.getGadgetListDetectedByOneHub(this.hubInfoWindow.id);
                    this._.forEach(gadgets, (gadget) => {
                        const el = document.getElementById(gadget.gid);
                        if (!!el) {
                            const gadgetData = this.$store.getters.getdetectedGadgetList[gadget.gid];
                            el.onclick = () => {
                                if (!!this.bcnsData[gadget.gid]) {
                                    this.showGadgetInFoWindow(gadgetData, this.bcnsData[gadget.gid].marker);
                                }
                            }
                        }
                    });
                }
            },
            registerHubHandlerInGadgetInfoWindow() {
                if (!!this.gadgetInfoWindow) {
                    const hubs = this.$store.getters.getHubListDetectOneGadget(this.gadgetInfoWindow.id);
                    this._.forEach(hubs, (hub) => {
                        const el = document.getElementById(`${ hub.hid }-scanner`);
                        if (!!el) {
                            const hubData = this.$store.getters.getHub(hub.hid);
                            el.onclick = () => {
                                if (!!this.markerMap.hubs[hub.hid]) {
                                    this.showHubInfoWindow(hub.hid, this.markerMap.hubs[hub.hid]);
                                }
                            }
                        }
                    })
                }
            },
            isShowingByStage(stage) {
                return this.userStage <= stage;
            },
            _getMarkerSize(tag) {   //TODO: 마커들의 크기를 tag별로 꺼내는 함수
                let markerWidth = {stops: [[4, 15], [5, 20], [6, 25], [7, 30]]},
                    markerHeight = {stops: [[4, 15], [5, 20], [6, 25], [7, 30]]};
                // BASE
                // markerWidth = {stops: [[4, 15], [5, 20], [6, 25], [7, 30]]}
                // markerHeight = {stops: [[4, 15], [5, 20], [6, 25], [7, 30]]};
                if (this._.includes(this.tags.xll, tag)) {
                    // JB, Shotcreate
                    // markerHeight *= 2.0;
                    markerHeight = {stops: [[4, 30], [5, 40], [6, 50], [7, 60]]};
                    if (this._.isEqual(tag, "8")) {
                        // markerWidth *= 3.1;
                        markerWidth = {stops: [[4, 46.5], [5, 62], [6, 77.5], [7, 93]]};
                    } else {
                        // markerWidth *= 3.7;
                        markerWidth = {stops: [[4, 55.5], [5, 74], [6, 92.5], [7, 111]]};
                    }
                } else if (this._.includes(this.tags.xl, tag)) {
                    // Charging, MPU, CPU, EV, Mixer
                    // markerWidth *= 2.0;
                    markerWidth = {stops: [[4, 30], [5, 40], [6, 50], [7, 60]]};
                    // markerHeight *= 1.6;
                    markerHeight = {stops: [[4, 24], [5, 32], [6, 40], [7, 48]]};
                } else if (this._.includes(this.tags.l, tag)) {
                    // Loader, Dumper, Wheel, crawer, JCB, Dozer
                    // markerHeight *= 1.4;
                    markerHeight = {stops: [[4, 21], [5, 28], [6, 35], [7, 42]]};
                    if (this._.isEqual(tag, "9") || this._.isEqual(tag, "11")) {
                        // markerWidth *= 1.5;
                        markerWidth = {stops: [[4, 22.5], [5, 30], [6, 37.5], [7, 45]]};
                    } else if (this._.isEqual(tag, "4") || this._.isEqual(tag, "5")) {
                        // markerWidth *= 1.8;
                        markerWidth = {stops: [[4, 27], [5, 36], [6, 45], [7, 54]]};
                    } else {
                        // markerWidth *= 1.4;
                        markerWidth = {stops: [[4, 21], [5, 28], [6, 35], [7, 42]]};
                    }
                } else {
                    // Core Drilling, Grouting, Mai pump, bus, wcbh
                    // markerHeight *= 1.2;
                    markerHeight = {stops: [[4, 18], [5, 24], [6, 30], [7, 36]]};
                    if (this._.isEqual(tag, "17") || this._.isEqual(tag, "10")) {
                        // markerWidth *= 1.3;
                        markerWidth = {stops: [[4, 19.5], [5, 26], [6, 32.5], [7, 39]]};
                    } else if (this._.isEqual(tag, "12")) {
                        // markerWidth *= 1.4;
                        markerWidth = {stops: [[4, 21], [5, 28], [6, 35], [7, 42]]};
                    } else {
                        // markerWidth *= 1.3;
                        markerWidth = {stops: [[4, 19.5], [5, 26], [6, 32.5], [7, 39]]};
                    }
                }

                return {
                    width: markerWidth,
                    height: markerHeight
                };
            },
            _registerGadgetInfoWindowHandler(gadget) {
                const el = document.getElementById(`${ gadget.gid }loader`),
                    panel = document.getElementById(`${ gadget.gid }loading-panel`);

                let gadgetData = this.$store.getters.getGadget(gadget.gid),
                    ipcamData = null,
                    content = '';
                if (!!gadgetData) {
                    if (!!gadgetData.img_url) {
                        let imgElement = document.getElementById(`${ gadget.gid }img`);
                        if (!this._.isEmpty(imgElement)) {
                            imgElement.src = gadgetData.img_url;
                        }
                    }
                }
                if (!!el) {
                    el.remove();
                    panel.remove();
                }
                const closePanel = document.getElementsByClassName('close-button-custom')[0];
                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                    if (this._.has(this.gadgetInfoWindow, 'ipcamId')) {
                        document.getElementsByClassName('scannerNameList')[0].classList.add('extend-scannerNameList');
                        content = `<div class="bcnsKey2">Ipcam</div>
                                <label class="gadget-moi-streaming-onoff-toggle beacon">
                                <input id="${ gadget.gid }-streaming-moi-button" class="gadget-streaming-moi-toggle-button beacon" type="checkbox">
                                <span id ="${ gadget.gid }-streaming-slider" class="gadget-streaming-moi-toggle-slider beacon round"></span></label>`
                        ipcamData = this.$store.getters.getIpCam(this.gadgetInfoWindow.ipcamId);
                    }
                    const scannerDataEl = document.getElementById(`${ gadget.gid }name-data`),
                        moiContainer = document.getElementsByClassName('beacon-moi-container')[0];
                    if (!!scannerDataEl && !!!moiContainer) {
                        const moiEl = document.createElement('div');
                        moiEl.className = 'beacon-moi-container';
                        moiEl.innerHTML = `<div class="bcnskey1">MOI System</div><div class="bcnsKey2">Beacon</div>
                            <label class="moi-onoff-toggle beacon">
                            <input id="${ gadget.gid }-moi-button" class="moi-toggle-button beacon" type="checkbox">
                            <span id ="${ gadget.gid }-slider" class="moi-toggle-slider beacon round"></span></label>
                            ${ content }`;

                        scannerDataEl.before(moiEl);

                        document.getElementById(`${ gadget.gid }-moi-button`).disabled = !this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN);
                        document.getElementById(`${ gadget.gid }-moi-button`).checked = !!gadget.custom.is_visible_moi;

                        if (!!document.getElementById(`${ gadget.gid }-streaming-moi-button`)) {
                            document.getElementById(`${ gadget.gid }-streaming-moi-button`).disabled = !this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN);
                            document.getElementById(`${ gadget.gid }-streaming-moi-button`).checked = !!ipcamData.custom.is_visible_moi;
                        }
                    }

                    if (this._.has(gadget.custom, 'is_visible_moi')) {
                        if (gadget.custom.is_visible_moi) {
                            document.getElementById(`${ gadget.gid }-slider`).innerText = 'ON';
                        } else {
                            document.getElementById(`${ gadget.gid }-slider`).innerText = 'OFF';
                        }
                    } else {
                        document.getElementById(`${ gadget.gid }-slider`).innerText = 'OFF';
                    }

                    if (this._.has(this.gadgetInfoWindow, 'ipcamId')) {
                        const ipcamData = this.$store.getters.getIpCam(this.gadgetInfoWindow.ipcamId);
                        if (ipcamData.custom.is_visible_moi) {
                            document.getElementById(`${ gadget.gid }-streaming-slider`).innerText = 'ON';
                        } else {
                            document.getElementById(`${ gadget.gid }-streaming-slider`).innerText = 'OFF';
                        }
                    }

                    const element = document.getElementById(`${ gadget.gid }-moi-button`),
                        streaming_el = document.getElementById(`${ gadget.gid }-streaming-moi-button`);
                    if (!!element) {
                        element.onchange = () => {
                            const _gadget = this._.cloneDeep(this.$store.getters.getGadget(gadget.gid)),
                                isVisible = element.checked;
                            document.getElementById(`${ gadget.gid }-slider`).innerText = 'OFF';
                            if (isVisible) {
                                document.getElementById(`${ gadget.gid }-slider`).innerText = 'ON';
                            }

                            _gadget.custom.is_visible_moi = isVisible;
                            this._updateData([_gadget], 'mibsskec', (failedList) => {
                                if (!this._.isEmpty(failedList)) {
                                    this.sweetbox.fire('Sorry, Gadget data update failed');
                                }
                                console.log("Succeed to update gadget data");
                            });
                        }
                    }

                    if (!!streaming_el) {
                        streaming_el.onchange = () => {
                            let _ipcam = this._.cloneDeep(this.$store.getters.getIpCam(gadgetData.custom.ipcamId)),
                                is_visible_moi = streaming_el.checked;
                            document.getElementById(`${ gadget.gid }-streaming-slider`).innerText = 'OFF';
                            if (is_visible_moi) {
                                document.getElementById(`${ gadget.gid }-streaming-slider`).innerText = 'ON';
                            }
                            _ipcam.custom.is_visible_moi = is_visible_moi;
                            this._updateData([_ipcam], 'ipcam', (failedList) => {
                                if (!this._.isEmpty(failedList)) {
                                    this.sweetbox.fire('Sorry, Ipcam data update failed');
                                }
                            })
                        }
                    }
                }

                if (!!closePanel) {
                    closePanel.onclick = () => {
                        if (!!this.gadgetInfoWindow)   {
                            this.gadgetInfoWindow.item.remove();
                        }
                    }
                }

                this.gadgetInfoWindow.item.on('remove', () => {
                    if (!!this.gadgetInfoWindow) {
                        if (this._.has(this.gadgetInfoWindow, 'ipcamId')) {
                            this._destroyStreaming(this.gadgetInfoWindow.ipcamId);
                            document.getElementsByClassName('scannerNameList')[0].classList.remove('extend-scannerNameList');
                        }
                        this.gadgetInfoWindow = null;
                    }
                })
            },
            _setBeaconOpacity(marker, duration, opacity, finishCallback) {
                const targetStyles = {
                    'symbol': {
                        'markerOpacity': opacity
                    }
                }
                marker.animate(
                    targetStyles, {
                        duration: duration,
                        easing: 'inAndOut',
                    }, (frame) => {
                        if (frame.state.playState === 'finished') {
                            if (!!finishCallback) {
                                finishCallback();
                            }
                        }
                    }
                )
            },
            _playStreaming(url, ipcamId) {
                if (!this._.has(this.ipcamStreamData, ipcamId)) {
                    this.ipcamStreamData[ipcamId] = {
                        hls: new Hls(),
                        video: document.getElementById('video_player')
                    };
                    if (!!this.ipcamStreamData[ipcamId].video) {
                        this.ipcamStreamData[ipcamId].hls.attachMedia(this.ipcamStreamData[ipcamId].video);
                        this.ipcamStreamData[ipcamId].hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            this.ipcamStreamData[ipcamId].video.play();
                        });
                        this.ipcamStreamData[ipcamId].hls.loadSource(url);
                        this.ipcamStreamData[ipcamId].hls.on(Hls.Events.ERROR, (event, data) => {
                            console.log("Failed to load ipcam streaming");
                            // this.sweetbox.fire('Failed to load Ipcam Streaming');
                        });
                    }
                }
            },
            _destroyStreaming(ipcamId) {
                if (this._.has(this.ipcamStreamData, ipcamId)) {
                    this.ipcamStreamData[ipcamId].hls.destroy();
                    this.ipcamStreamData = {};
                    this.closeIpcamStreaming([ipcamId], (res) => {
                        if (!this._.isEmpty(res)) {
                            this.sweetbox.fire('Sorry, disconnect Ipcam Streaming failed');
                        }
                    });
                }
            },
            _selectIpcamFileUrl(ipcamId) {
                const ipcamData = this.$store.getters.getIpCam(ipcamId),
                      tagData = this._.first(ipcamData.tags);
                let fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-ipcam1-on.svg`;
                if (tagData === "0" || tagData === "1") {
                    if (ipcamData.status) {
                        fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-ipcam${ tagData }-on.svg`;
                        if (ipcamData.custom.is_visible_moi) {
                            fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-ipcam${ tagData }-moi-on.svg`;
                        }
                    } else {
                        fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-ipcam${ tagData }-off.svg`;
                    }
                } else if (!!!tagData) {
                    if (ipcamData.status) {
                        fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-ipcam1-on.svg`;
                        if (ipcamData.custom.is_visible_moi) {
                            fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-ipcam1-moi-on.svg`;
                        }
                    } else {
                        fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-ipcam1-off.svg`;
                    }
                } else {
                    // Maybe equipment type?
                    if (!ipcamData.status) {
                        fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-ipcam1-off.svg`;
                    }
                }
                return {
                    fileUrl: fileUrl
                }
            },
            _selectBeaconFileUrl(gid) {
                const beaconData = this.$store.getters.getGadget(gid),
                      tag = this._.first(beaconData.tags);
                let fileUrl = '';
                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_NORMAL)) {
                    if (!this._.isEmpty(beaconData.tags)) {
                        if (this._.has(beaconData.custom, 'ipcamId')) {
                            const ipcamData = this.$store.getters.getIpCam(beaconData.custom.ipcamId);
                            if (ipcamData.custom.is_visible_moi) {
                                if (beaconData.custom.is_visible_moi) {
                                    fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-worker${ tag }-double-moi-on.svg`;
                                } else {
                                    fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-worker${ tag }-moi-off.svg`;
                                }

                            } else {
                                if (beaconData.custom.is_visible_moi) {
                                    fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-worker${ tag }-beacon-moi-on.svg`;
                                } else {
                                    fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-worker${ tag }-ipcam-moi-off.svg`;
                                }
                            }
                        } else {
                            if (beaconData.custom.is_visible_moi) {
                                fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-worker${ tag }-moi-on.svg`;
                            } else {
                                fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-worker${ tag }-tab.svg`;
                            }
                        }
                    } else {
                        fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }lostTag.svg`;
                    }
                } else {
                    if (!this._.isEmpty(beaconData.tags)) {
                        fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-worker${ tag }-tab.svg`;
                    } else {
                        fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }lostTag.svg`;
                    }
                }

                return {
                    fileUrl: fileUrl
                }
            },
            _showItemsByStage() {
                this._.forEach(this.markerMap.cams, (marker, ipcamId) => {
                    marker.remove();
                });
                this._.forEach(this.bcnsData, (bcn, gid) => {
                    bcn.marker.remove();
                })

                // this.drawnGadgetList = {};
                this.bcnsData = {};
                this.markerMap.cams = {};

                const ipcams = this.$store.getters.getIpCams;
                this._.forEach(this.markerMap.hubs, (marker, hid) => {
                    this.drawWorkers(hid, marker._coordinates);
                });

                this.drawIpCams(ipcams, true);
            },
            _getSortList(data, key) {
                let sortData = data;
                sortData = _.sortBy(sortData, key);
                sortData = _.reverse(sortData);
                sortData = _.values(sortData);
                return sortData;
            },
            _handleAdded(data) {
                if (this.isScanner(data.kind)) {
                    this._handleAddHub(data.v);
                } else if (this.isIpcam(data.kind)) {
                    this._handleAddIpcam(data.v);
                } else if (this.isBeacon(data.kind)) {
                    this._handleAddGadget(data.v);
                } else if (this.isSpeaker(data.kind)) {
                    this._handleAddSpeaker(data.v);
                } else {
                    this._handleAddAlarm(data.v);
                }
            },
            _handleAddHub(data) {
                this.$store.commit('addHub', data);
            },
            _handleAddGadget(data) {
                this.$store.commit('addGadget', data);
                if (this._.has(data.custom, 'ipcamId')) {
                    this.$store.commit('addIpcamIdAttachedOnBeacon', {ipcamId: data.custom.ipcamId, gid: data.id});
                }
            },
            _handleAddIpcam(data) {
                this.$store.commit('addIpcam', data);
            },
            _handleAddSpeaker(data) {
                this.$store.commit('addSpeaker', data);
            },
            _handleAddAlarm(data) {
                this.$store.commit('addAlarms', data);
            },
            _handleUpdated(data) {
                if (this.isScanner(data.kind)) { // 허브 업데이트
                    this._handleUpdatedHub(data.v);
                } else if (this.isIpcam(data.kind)) { //아이피캠 업데이트
                    this._handleUpdatedIpcam(data.v);
                } else if (this.isBeacon(data.kind)) {
                    this._handleUpdatedBeacon(data.v); //비콘 업데이트
                } else {
                    this._handleUpdatedSpeaker(data.v); //스피커 업데이트
                }
            },
            _handleUpdatedHub(data) {
                let hubMarker = this.markerMap.hubs[data.id],
                    hubData = this._.cloneDeep(this.$store.getters.getHub(data.id));

                this._.extend(hubData, data);
                this.$store.commit('updateHubData', hubData);

                if (!!data.custom) {
                    if (this._.has(data.custom, 'map_location')) { //  hub map_location 값이 변한경우
                        this.drawHub(data.id, data.custom.map_location, true);
                        this.hasSameGadget();
                        this.drawWorkers(data.id, data.custom.map_location);
                    } else {
                        if (!!hubMarker) {
                            hubMarker.remove();
                            delete this.markerMap.hubs[data.id];
                        }
                        if (!!this.gadgetInfoWindow) { //TODO
                            const hubData = this.$store.getters.getHubListDetectOneGadget(this.gadgetInfoWindow.id);
                            if (!!hubData) {
                                if (this._.includes(this._.keys(hubData), data.id)) {
                                    let el = document.getElementById(`${ data.id }-scanner`);
                                    el.remove();
                                }
                            }
                        }
                    }

                    // hub is_counted가 바뀐경우
                    if (this._.has(data.custom, 'is_counted_hub')) {
                        if (!!hubMarker) {
                            if (data.custom.is_counted_hub) {
                                hubMarker.updateSymbol({
                                    markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-hub-tab10.svg`
                                });
                            } else {
                                if (!hubData.status) {
                                    hubMarker.updateSymbol({
                                        markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-hub1.svg`
                                    });
                                } else {
                                    hubMarker.updateSymbol({
                                        markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-hub-tab1.svg`
                                    });
                                }
                            }
                            if (!!this.hubInfoWindow) {
                                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                                    if (this._.isEqual(this.hubInfoWindow.id, data.id)) {
                                        document.getElementsByClassName('moi-toggle-button-hub')[0].checked = !!data.custom.is_counted_hub;
                                        document.getElementsByClassName('moi-toggle-slider-hub')[0].innerText = 'OFF';
                                        if (data.custom.is_counted_hub) {
                                            document.getElementsByClassName('moi-toggle-slider-hub')[0].innerText = 'ON';
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (this._.has(data.custom, 'lock')) {
                        if (!!hubMarker) {
                            hubMarker.config('draggable', !data.custom.lock);
                        }
                    }
                }

                if (!!data.tags) {
                    let bcnData = this.$store.getters.getHub(data.id),
                        bcnMarker = this.markerMap.hubs[data.id];

                    if (!!bcnMarker) {
                        bcnMarker.remove();
                        delete this.markerMap.hubs[data.id];
                        this.drawHub(data.id, bcnData.custom.map_location, true);
                    }
                }

                if(!!data.name) {
                    if(!!this.hubInfoWindow) {
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            if (this._.isEqual(this.hubInfoWindow.id, data.id)) {
                                let element = document.getElementsByClassName('hubInfo')[0];
                                element.title = data.name;
                                element.innerText = data.name;
                            }
                        }
                    }
                    if (!!this.gadgetInfoWindow) {
                        const hubData = this.$store.getters.getHubListDetectOneGadget(this.gadgetInfoWindow.id);
                        if (!!hubData) {
                            if (this._.includes(this._.keys(hubData), data.id)) {
                                let el = document.getElementById(`${ data.id }-scanner`);
                                if (!!el) {
                                    el.title = data.name;
                                    el.innerText = data.name;
                                }
                            }
                        }
                    }
                }
            },
            _handleUpdatedIpcam(data) {
                let ipcamMarker = this.markerMap.cams[data.id],
                    ipcamData = this._.cloneDeep(this.$store.getters.getIpCam(data.id)),
                    beaconDataAttachIpcam = this.$store.getters.getIpcamIdAttachedOnBeacon(data.id);
                const moiData = ipcamData.custom.is_visible_moi;
                this._.extend(ipcamData, data);
                this.$store.commit('updateIpcamData', ipcamData);
                //맵에 ipcam이 있는데 로케이션값이 달라진 경우
                if (!!data.custom) {
                    if (this._.has(data.custom, 'map_location')) {
                        this.drawIpcam(data.id, data.custom.map_location, true);
                    } else {
                        if (!!ipcamMarker) {
                            ipcamMarker.remove();
                            delete this.markerMap.cams[data.id];
                        }
                    }

                    if (this._.has(data.custom, 'is_visible_moi')) {
                        if (!!ipcamMarker) {
                            const fileUrl = this._selectIpcamFileUrl(data.id).fileUrl;
                            ipcamMarker.updateSymbol({
                                markerFile: fileUrl
                            });

                            if (!this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_NORMAL)) {
                                if (!ipcamMarker.isVisible() && data.custom.is_visible_moi) {
                                    ipcamMarker.show();
                                } else if (ipcamMarker.isVisible() && !data.custom.is_visible_moi) {
                                    ipcamMarker.hide();
                                }
                            }
                        }

                        if (!!beaconDataAttachIpcam) {
                            let beaconData = this.bcnsData[beaconDataAttachIpcam];
                            if (!!beaconData) {
                                let beaconMarker = beaconData.marker;
                                const fileUrl = this._selectBeaconFileUrl(beaconDataAttachIpcam).fileUrl;
                                beaconMarker.updateSymbol({
                                    markerFile: fileUrl
                                })
                                if (!this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                                    if (!!this.gadgetInfoWindow) {
                                        this.gadgetInfoWindow.item.remove();
                                    }
                                }
                            }
                        }
                        if (!!this.ipcamInfoWindow) {
                            if (this._.isEqual(this.ipcamInfoWindow.id, data.id)) {
                                document.getElementsByClassName('moi-toggle-button')[0].checked = !!data.custom.is_visible_moi;
                            }
                        }
                    }

                    if (this._.has(data.custom, 'lock')) {
                        if (!!ipcamMarker) {
                            console.log
                            ipcamMarker.config('draggable', !data.custom.lock);
                        }
                    }
                }

                if (!!data.name) {
                    if (!!this.ipcamInfoWindow) { //name 변경된 경우
                        if (this._.isEqual(this.ipcamInfoWindow.id, data.id)) {
                            const content = this.getIpcamInfoWindowContent(data.id),
                                ipcamContent = document.getElementsByClassName('ipcamInfo')[0];
                            if (!!ipcamContent) {
                                ipcamContent.title = data.name;
                                ipcamContent.innerText = data.name;
                            }
                        }
                    }
                }

                if (!!data.tags) {
                    let ipcamData = this.$store.getters.getIpCam(data.id),
                        ipcamMarker = this.markerMap.cams[data.id];
                    if (!!ipcamMarker) {
                        ipcamMarker.remove();
                        delete this.markerMap.cams[data.id]
                        this.drawIpcam(data.id, ipcamData.custom.map_location, true);
                    }
                }
            },
            _handleUpdatedBeacon(data) { //TODO: data에 어떻게 변경된 값이 오는지 알아야 함
                let bcnData = this.bcnsData[data.id];
                const gadget = this._.cloneDeep(this.$store.getters.getGadget(data.id)),
                      moiData = gadget.custom.is_visible_moi;
                this._.extend(gadget, data);
                this.$store.commit('updateGadgetData', gadget);
                if (!!bcnData) {
                    let bcnMarker = bcnData.marker;
                    // 비콘 tags, img, moi, name이 바뀐경우
                    if (!!data.tags) {
                        let tag = this._.first(data.tags);
                        if (window.CONSTANTS.IS_MOCK) {
                            tag = parseInt(tag) - 100;
                            tag = tag.toString();
                        }
                        if (!!bcnMarker) {
                            const coordinates = bcnData.marker._coordinates;
                            bcnMarker.remove();
                            delete this.bcnsData[data.id];
                            this.drawWorker({
                                gid: data.id
                            }, coordinates);
                        }

                        if (!!this.gadgetInfoWindow) {
                            if (this._.isEqual(this.gadgetInfoWindow.id, data.id)) {
                                const gadgetKind = window.CONSTANTS.GADGET_INFO[tag];
                                document.getElementsByClassName("bcnKind")[0].innerText = gadgetKind;
                                document.getElementById(`${ gadget.id }img`).src = `${ window.CONSTANTS.URL.BASE_IMG }item${ tag }.png`;
                            }
                        }
                    }
                    if (!!data.custom) {
                        if (data.custom.is_visible_moi !== moiData) {
                            this.$store.commit('updateGadgetMoiData', { id: data.id, isVisible: data.custom.is_visible_moi });
                            if (!this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_NORMAL)) {
                                if (!bcnMarker.isVisible() && data.custom.is_visible_moi) {
                                    bcnMarker.show();
                                } else if (bcnMarker.isVisible() && !data.custom.is_visible_moi) {
                                    bcnMarker.hide();
                                }
                            }
                        }

                        if (this._.has(data.custom, 'ipcamId')) {
                            if (this._.has(gadget.custom, 'ipcamId')) {
                                if (!this._.isEqual(data.custom.ipcamId, gadget.custom.ipcamId)) {
                                    this.$store.commit('updateIpcamIdAttachedOnBeacon', {ipcamId: data.custom.ipcamId, gid: data.id});
                                }
                            } else {
                                this.$store.commit('addIpcamIdAttachedOnBeacon', {ipcamId: data.custom.ipcamId, gid: data.id});
                            }
                            if (!!this.gadgetInfoWindow) {   //TODO
                                this.gadgetInfoWindow.item.remove();
                            }
                        } else {
                            if (this._.has(gadget.custom, 'ipcamId')) {
                                this.$store.commit('removeIpcamIdAttachedOnBeacon', gadget.custom.ipcamId);
                                if (!!this.gadgetInfoWindow) {   //TODO
                                    this.gadgetInfoWindow.item.remove();
                                }
                            }
                        }
                        const fileUrl = this._selectBeaconFileUrl(data.id).fileUrl;
                        bcnMarker.updateSymbol({
                            markerFile: fileUrl
                        })
                        if (!!this.gadgetInfoWindow) {
                            if (this._.isEqual(this.gadgetInfoWindow.id, data.id)) {
                                const element = document.getElementById(`${ gadget.id }-moi-button`);
                                element.checked = !!data.custom.is_visible_moi;
                                document.getElementById(`${ gadget.id }-slider`).innerText = 'OFF';
                                if (data.custom.is_visible_moi) {
                                    document.getElementById(`${ gadget.id }-slider`).innerText = 'ON';
                                }
                            }
                        }
                    }
                    if (!!data.name) {
                        if (!!this.gadgetInfoWindow) {
                            if (this._.isEqual(this.gadgetInfoWindow.id, data.id)) {
                                let element = document.getElementsByClassName('bcnName')[0];
                                element.title = data.name;
                                element.innerText = data.name;
                            }
                        }
                        if (!!this.hubInfoWindow) {
                            const gadgetData = this.$store.getters.getGadgetListDetectedByOneHub(this.hubInfoWindow.id);
                            if (!!gadgetData) {
                                if (this._.includes(gadgetData, data.id)) {
                                    let name_el = document.getElementById(`${ data.id }-detectedBeaconName`),
                                        time_el = document.getElementById(`${ data.id }-detectedBeaconTime`),
                                        time = new Date(gadgetData[data.id]._t * 1000).toLocaleTimeString('eu');
                                    if (!!name_el && !!time_el) {
                                        name_el.innerText = data.name;
                                        time_el.innerText = `Today ${ time }`;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            _handleUpdatedSpeaker(data) {
                let speakerMarker = this.markerMap.speakers[data.id],
                    speakerData = this._.cloneDeep(this.$store.getters.getSpeaker(data.id));

                this._.extend(speakerData, data);
                this.$store.commit('updateSpeakerData', speakerData);

                if (!!data.custom) {
                    if (this._.has(data.custom, 'map_location')) {
                        this.drawSpeaker(data.id, data.custom.map_location, true);
                    } else {
                        if (!!speakerMarker) {
                            speakerMarker.remove();
                            delete this.markerMap.speakers[data.id];
                        }
                    }
                }

                if (!!data.name) {
                    if (!!this.speakerInfoWindowItems) {

                    }
                }
            },
            _handleRemoved(data) {
                if (this.isScanner(data.kind)) { // 허브 업데이트
                    this._handleHubRemoved(data.v);
                } else if (this.isIpcam(data.kind)) { //아이피캠 업데이트
                    this._handleIpcamRemoved(data.v);
                } else if (this.isBeacon(data.kind)) {
                    this._handleGadgetRemoved(data.v);
                } else if (this.isSpeaker(data.kind)) {
                    this._handleSpeakerRemoved(data.v);
                } else {
                    this._handleAlarmRemoved(data.v);
                }
            },
            _handleHubRemoved(data) {
                // console.log("removeHub", data);
                this.$store.commit('removeHub', data.id);
                this.removeHubMarker(data.id);
            },
            _handleIpcamRemoved(data) {
                // console.log("removeIpcam", data);
                this.$store.commit('removeIpcam', data.id);
                this.removeIpcamMarker(data.id);
            },
            _handleGadgetRemoved(data) {
                // console.log("removeGadget", data);
                this.$store.commit('removeGadget', data.id)
                this.removeGadget(data.id);
            },
            _handleSpeakerRemoved(data) {
                this.$store.commit('removeSpeaker', data.id);
                this.removeSpeakerMarker(data.id);
            },
            _handleAlarmRemoved(data) {
                this.$store.commit('removeAlarms', data.id);
            },
            _handleDetectedGadgets(list) {
                const currentTime = new Date() / 1000.0;
                this._.forEach(list, (detectedData) => {
                    if (currentTime - detectedData._t < 50) {
                        this.$store.commit('addDetectedHubGadget', detectedData);
                        this.hasSameGadget();
                        const hubMarker = this.markerMap.hubs[detectedData.hid];
                        if (!!hubMarker) {
                            this.drawWorker(detectedData, hubMarker._coordinates);
                            // this.countGadgetOnHub(detectedData.hid);
                        }
                        if (!!this.hubInfoWindow) {
                            if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                                const content = this.getHubInfoWindowContent(this.hubInfoWindow.id),
                                    infoPanel = document.getElementById('worker-info-panel');
                                if (!!infoPanel) {
                                    infoPanel.innerHTML = content.context;
                                    document.getElementById('worker-info-count').innerText = content.count;
                                    this.registerGadgetHandlerInHubInfoWindow();
                                }
                            } else {
                                const content = this.getHubInfoWindowContent(this.hubInfoWindow.id),
                                    infoPanel = document.getElementById('normal-worker-info-panel');
                                if (!!infoPanel) {
                                    infoPanel.innerHTML = content.context;
                                    this.registerGadgetHandlerInHubInfoWindow();
                                }
                            }
                        }
                    }
                })
            },
            _handleDataRefresh() {
                const currentTime = new Date() / 1000.0;
                this._.forEach(this.bcnsData, (data, gid) => {
                    let hubObj = this.$store.getters.getHubListDetectOneGadget(gid),
                        hubList = this._getSortList(hubObj, ['_t']),
                        size = this._.size(hubList);

                    this._.forEach(hubList, (item, index) => {
                        const differentTime = currentTime - item._t;
                        if (differentTime > 25 && differentTime < 50) {
                            if (index === 0) {
                                this._setBeaconOpacity(data.marker, 300, 0.5);
                            }
                        } else if (differentTime >= 50) {
                            this.$store.commit('removeDetectedGadgetWithHub', item);
                            this.$store.commit('removeGadgetLocation', item.gid);
                        }
                    })
                    hubObj = this.$store.getters.getHubListDetectOneGadget(gid);
                    hubList = this._getSortList(hubObj, ['_t']);
                    size = this._.size(hubList);
                    if (size <= 0) {
                        this._setBeaconOpacity(data.marker, 600, 0, () => {
                            data.marker.remove();
                            data.marker.removeInfoWindow();
                            delete this.bcnsData[gid];
                        });
                    } else {
                        if (size > 1) {
                            this.setGadgetLocation(hubList);
                        }
                        const hubMarker =this.markerMap.hubs[hubList[0].hid];
                        if (!!hubMarker) {
                            this.drawWorker(hubList[0], hubMarker._coordinates);
                        }
                    }
                });
            },
            _handleOnline(data) {
                switch(data.kind) {
                    case window.CONSTANTS.PRODUCT_KIND.HUB:
                        this._handleHubOnline(data.v);
                    break;
                    case window.CONSTANTS.PRODUCT_KIND.IPCAM:
                        this._handleIpcamOnline(data.v);
                    break;
                    case window.CONSTANTS.PRODUCT_KIND.SPEAKER:
                        this._handleSpeakerOnline(data.v);
                    break;
                }
            },
            _handleOffline(data) {
                switch(data.kind) {
                    case window.CONSTANTS.PRODUCT_KIND.HUB:
                        this._handleHubOffline(data.v);
                    break;
                    case window.CONSTANTS.PRODUCT_KIND.IPCAM:
                        this._handleIpcamOffline(data.v);
                    break;
                    case window.CONSTANTS.PRODUCT_KIND.SPEAKER:
                        this._handleSpeakerOffline(data.v);
                    break;
                }
            },
            _handleHubOnline(data) {
                let hubMarker = this.markerMap.hubs[data.id],
                    hubData = this._.clone(this.$store.getters.getHub(data.id));
                if (!!hubData) {
                    hubData.status = 1;
                    this.$store.commit('updateHubData', hubData);
                    if (!!hubMarker) {
                        hubMarker.updateSymbol({
                            markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-hub-tab1.svg`
                        });
                    }
                }
            },
            _handleIpcamOnline(data) {
                let ipcamMarker = this.markerMap.cams[data.id],
                    ipcamData = this._.clone(this.$store.getters.getIpCam(data.id)),
                    markerFile = '';
                if (!!ipcamData) {
                    ipcamData.status = 1;
                    this.$store.commit('updateIpcamData', ipcamData);
                    if (!!ipcamMarker) {
                        markerFile = this._selectIpcamFileUrl(data.id).fileUrl;
                        ipcamMarker.updateSymbol({
                            markerFile: markerFile
                        })
                    }
                }
            },
            _handleSpeakerOnline(data) {
                let speakerMarker = this.markerMap.speakers[data.id],
                    speakerData = this._.clone(this.$store.getters.getSpeaker(data.id));
                speakerData.status = 1;
                this.$store.commit('updateSpeakerData', speakerData);
                if (!!speakerMarker) {
                    speakerMarker.updateSymbol({
                        markerFile: `${ window.CONSTANTS.URL.BASE_IMG }speaker.svg`
                    });
                }
            },
            _handleHubOffline(data) {
                let hubMarker = this.markerMap.hubs[data.id],
                    hubData = this._.cloneDeep(this.$store.getters.getHub(data.id));
                hubData.status = 0;
                this.$store.commit('updateHubData', hubData);
                if (!!hubMarker) {
                    hubMarker.updateSymbol({
                        markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-hub1.svg`
                    });
                }
            },
            _handleIpcamOffline(data) {
                let ipcamMarker = this.markerMap.cams[data.id],
                    ipcamData = this._.clone(this.$store.getters.getIpCam(data.id)),
                    fileUrl = '';
                if (!!ipcamData) {
                    ipcamData.status = 0;
                    this.$store.commit('updateIpcamData', ipcamData);
                    if (!!ipcamMarker) {
                        fileUrl = this._selectIpcamFileUrl(data.id).fileUrl;
                        ipcamMarker.updateSymbol({
                            markerFile: fileUrl
                        })
                    }
                }
            },
            _handleSpeakerOffline(data) {
                let speakerMarker = this.markerMap.speakers[data.id],
                    speakerData = this._.clone(this.$store.getters.getSpeaker(data.id));
                speakerData.status = 0;
                this.$store.commit('updateSpeakerData', speakerData);
                if (!!speakerMarker) {
                    speakerMarker.updateSymbol({
                        markerFile: `${ window.CONSTANTS.URL.BASE_IMG }speaker-offline.png`
                    });
                }
            },
            _handleReopenStream(data) {
                if (!!this.ipcamInfoWindow) {
                    this._.forEach(data, (item) => {
                        var key = this._.keys(item)[0],
                            value = this._.values(item)[0];
                        if (this._.isString(value)) {
                            if (this.ipcamInfoWindow.id === key) {
                                this._playStreaming(value);
                            }
                        } else {
                            let ipcamMarker = this.markerMap.cams[key];
                            this.handleErrorStreaming(value);
                            this.closeIpcamStreaming([key], (res) => {
                                if (!this._.isEmpty(res)) {
                                    console.log("Close stream Failed");
                                } else {
                                    console.log("Close stream succedd");
                                }
                            });
                            ipcamMarker.removeInfoWindow();
                        }
                    });
                }
            },
            _handleUpdateAlarmList(data) {
                const list = data.v;
                if (data.kind === 'add') {

                } else if (data.kind === 'remove') {

                } else if (data.kind === 'update') {

                }
            },
            _handleUpdateGroupList(data) {
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        this.$store.commit('addGroup', item);
                        this.addGroupLayer(item.id);
                    } else if (data.kind === 'remove') {
                        this.$store.commit('removeGroup', item);
                    } else if (data.kind === 'update') {
                        const group = this.$store.getters.getGroup(item.id);
                        group.name = item.name;
                        this.$store.commit('updateGroup', group);
                    }
                });
            },
            _handleStreamingStatus(data) {
                //TODO: event handling
                const isStatus = data.v,
                      nowStatus = this.$store.getters.getNowPlaying;
                this.onAir = isStatus;
                this.$store.commit('updateStreamingStatus', isStatus)
                if (!isStatus) {
                    this.$store.commit('updateNowPlaying', 0)
                } else {
                    if (nowStatus == 0) {
                        this.$store.commit('updateNowPlaying', 2)
                    }
                }
            },
            _handleFailedList(data){
                var respName = data.v,
                nameList = respName.join(',');
                this.sweetbox.fire('speaker does not contain an IP address. Target Speaker : ' + nameList)
            },
            _getGadgetCountListTr(data, key) {
                var tr = '<div class="gcTrContainer">' +
                            '<div class="gcTdFirstContainer">' + data.kind[key] +
                            '</div>' +
                            '<div class="gcTdContainer">' + data.at1[key].length +
                            '</div>' +
                            '<div class="gcTdContainer">' + data.at2[key].length +
                            '</div>' +
                            '<div class="gcTdContainer">' + data.other[key].length +
                            '</div>' +
                            '<div class="gcTdContainer">' + (data.at1[key].length + data.at2[key].length + data.other[key].length) +
                            '</div>' +
                        '</div>';
                return tr;
            },
            _showGadgetCountList() {
                if (this.gadgetCountInfoWindow == null) {
                    this.services.getGadgetCountList((data) => {
                        var context = '<div class="gcContainer">' +
                                '<div class="gcTrContainer" style="border-bottom: 1px solid #555555;padding-top:5px">' +
                                    '<div class="gcTdFirstContainer">Kind' +
                                    '</div>' +
                                    '<div class="gcTdContainer">AT1' +
                                    '</div>' +
                                    '<div class="gcTdContainer">AT2' +
                                    '</div>' +
                                    '<div class="gcTdContainer">Other' +
                                    '</div>' +
                                    '<div class="gcTdContainer">Total' +
                                    '</div>' +
                                '</div>';

                        context += this._getGadgetCountListTr(data, '1');
                        context += this._getGadgetCountListTr(data, '2');
                        context += this._getGadgetCountListTr(data, '3');
                        context += this._getGadgetCountListTr(data, '4');
                        context += this._getGadgetCountListTr(data, '5');
                        context += this._getGadgetCountListTr(data, '6');
                        context += this._getGadgetCountListTr(data, '7');
                        context += this._getGadgetCountListTr(data, '8');
                        context += this._getGadgetCountListTr(data, '9');
                        context += this._getGadgetCountListTr(data, '10');
                        context += this._getGadgetCountListTr(data, '11');
                        context += this._getGadgetCountListTr(data, '12');
                        context += this._getGadgetCountListTr(data, '13');
                        context += this._getGadgetCountListTr(data, '14');
                        context += this._getGadgetCountListTr(data, '15');
                        context += this._getGadgetCountListTr(data, '16');
                        context += this._getGadgetCountListTr(data, '17');
                        context += this._getGadgetCountListTr(data, '18');
                        context += this._getGadgetCountListTr(data, '19');
                        context += '</div>';
                        var options = {
                            'autoOpenOn' : false,  //set to null if not to open window when clicking on map
                            'single' : false,
                            'custom' : true,
                            'animation': null,
                            'content' : context
                        };
                        var infoWindow = new maptalks.ui.InfoWindow(options);
                        infoWindow.addTo(this.map).show({x:150, y:45});
                        this.gadgetCountInfoWindow = infoWindow;
                    }, (error) => {
                        console.log("Failed to get gadget count list", error);
                    });
                } else {
                    this.gadgetCountInfoWindow.hide();
                    this.gadgetCountInfoWindow = null;
                }
            },
            _subscribe() {
                this.services.subscribe(this.info.internal, {
                    added: (data) => {
                        if (!this.isRemoveAll) {
                            this._handleAdded(data);
                        }
                    },
                    updated: (data) => {
                        if (!this.isRemoveAll) {
                            this._handleUpdated(data);
                        }
                    },
                    removed: (data) => {
                        if (!this.isRemoveAll) {
                            this._handleRemoved(data);
                        }
                    },
                    getDetectedList: (data) => {
                        if (!this.isRemoveAll) {
                            this._handleDetectedGadgets(data.v);
                        }
                    },
                    online: (data) => {
                        if (!this.isRemoveAll) {
                            this._handleOnline(data);
                        }
                    },
                    offline: (data) => {
                        if (!this.isRemoveAll) {
                            this._handleOffline(data);
                        }
                    },
                    refresh: (data) => {
                        if (!this.isRemoveAll) {
                            this._handleDataRefresh();
                        }
                    },
                    reopenStream: (data) => {
                        this._handleReopenStream(data.v);
                    },
                    updateAlarmList: (data) => {
                        this._handleUpdateAlarmList(data);
                    },
                    updateGroupList: (data) => {
                        this._handleUpdateGroupList(data);
                    },
                    updateStreamingStatus: (data) => {
                        this._handleStreamingStatus(data);
                    },
                    failedList: (data) => {
                        this._handleFailedList(data);
                    }
                });
            }
        },
        computed: {
            isEmptyUrl() {
                return this._.isEmpty(this.mapUrl);
            },
            isShowingInfoWindow() {
                return !this._.isEmpty(this.speakerInfoWindowItems);
                // return true;
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
                this.choiceFilter();
            });
            EventBus.$on('removeItem', () => {
                this.removeItems();
            });
            EventBus.$on('beaconCountList', () => {
                this._showGadgetCountList();
            });

            window.addEventListener("beforeunload", () => {
                this.services.unsubscribe();
            });

            if (this.isConnected) {
                this._subscribe();
            }
            this.userStage = this.info.stage;
        },
        mounted() {
            this.initloadMap();
        },
        watch: {
            isConnected: function() {
                this.toast = this.sweetbox.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 10000,
                });
                this.toast.fire({
                    type: "success",
                    title: 'Server connected'
                })
                // register event
                if (this.isConnected) {
                    this._subscribe();
                } else {
                    this.toast = this.sweetbox.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 10000,
                    });
                    this.toast.fire({
                        type: "error",
                        title: 'Server disconnected',
                    })
                }
            }
        },
        mixins: [util]
    }
</script>

<style>
    html,
    body {
        overflow: hidden;
    }

    #map {
        width: 100%;
        height: 100%;
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

    .main-container {
        position: absolute;
        width: 100%;
        height: 95%;
        top: 50px;
        left: 0;
    }

    .tunnelSelect {
        height: 50px;
    }

    .tn .dpth {
        font-size: 25px;
        font-weight: 300;
    }

    .filterTitle {
        font-size: 19px !important;
        font-weight: 900 !important;
    }

    .infoFilterGadget{
        display: inline-block;
        transform: translateX(-170%);
        position: absolute;
        top: 65%;
    }

    .infoFilterHub {
        display: inline-block;
        transform: translateX(-110%);
        position: absolute;
        top: 65%;
    }

    .infoFilterIpcam {
        display: inline-block;
        transform: translateX(-205%);
        position: absolute;
        top: 65%;
    }

    .infoFilterSpeaker {
        display: inline-block;
        transform: translateX(-140%);
        top: 65%;
        position: absolute;
    }

    .infoFilterMoi{
        display: inline-block;
        transform: translateX(-235%);
        top: 65%;
        position: absolute;
    }
    .filterHubIcon {
        width: 60px;
        height: 60px;
        cursor: pointer;
        border-color: #fff;
        margin-left: 15px;
        margin-bottom: 20px;
        margin-top: 15px;
        margin-right: 15px;
        background-repeat: no-repeat;
        background-image: url('../../public/static/location/imgs/icon-hub-tab1.svg');
        background-color: white;
        border: none;
    }

    .filterGadgetIcon {
        width: 85px;
        height: 60px;
        margin-right: 15px;
        margin-bottom: 20px;
        margin-top: 15px;
        cursor: pointer;
        border-color: #fff;
        background-repeat: no-repeat;
        background-size: 80px;
        background-image: url('../../public/static/location/imgs/icon-worker4-tab.svg');
        background-color: white;
        border: none;
    }

    .filterIpcamIcon {
        width: 60px;
        height: 60px;
        margin-left: 25px;
        margin-bottom: 20px;
        margin-top: 10px;
        margin-right: 15px;
        cursor: pointer;
        border-color: #fff;
        background-repeat: no-repeat;
        background-image: url('../../public/static/location/imgs/icon-ipcam1-on.svg');
        background-color: white;
        border: none;
    }

    .filterSpeakerIcon {
        width: 60px;
        height: 60px;
        cursor: pointer;
        border-color: #fff;
        margin-left: 18px;
        margin-bottom: 20px;
        margin-top: 15px;
        background-repeat: no-repeat;
        background-image: url('../../public/static/location/imgs/speaker.svg');
        background-color: white;
        border: none;
    }

    .filterMoiIcon {
        width: 60px;
        height: 60px;
        cursor: pointer;
        border-color: #fff;
        margin-left: 30px;
        margin-bottom: 20px;
        margin-top: 15px;
        border-radius: 50%;
        background-color: white;
        border: none;
        background-repeat: no-repeat;
        background-image: url('../../public/static/location/imgs/icon-moi-tab.svg');
    }

    .speakerFilter {
        background-image: url('../../public/static/location/imgs/speaker-tab.svg');
    }

    .moiFilter {
       background-image: url('../../public/static/location/imgs/icon-moi.svg');
    }

    .moi-onoff-toggle {
        position: relative;
        display: inline-block;
        width: 55px;
        height: 28px;
        left: 85%;
        top: 27%;
    }

    .moi-onoff-toggle-ipcam {
        position: absolute;
        display: inline-block;
        width: 55px;
        height: 28px;
        left: 74%;
        top: 27%;
    }

    .moi-onoff-toggle.beacon {
        height: 25px;
        left: 0;
        top: 50%;
        margin-top: 7px;
    }

    .gadget-moi-streaming-onoff-toggle {
        position: relative;
        display: inline-block;
        width: 55px;
        height: 28px;
        left: 85%;
        top: 27%;
    }

    .gadget-moi-streaming-onoff-toggle.beacon {
        height: 25px;
        left: 0;
        top: 50%;
        margin-top: 7px;
    }

    .bottom-shape {
        width: 30px;
        height: 30px;
        transform: rotate(45deg);
        background-color: rgb(60 135 65);
        top: 94%;
        position: absolute;
        left: 47.5%;
    }

    .plus-symbol {
        background-image: url('../../public/static/location/imgs/plus-black-symbol.svg');
        width: 60px;
        height: 60px;
        left: 50%;
        position: absolute;
        top: -25px;
        transform: translateX(-50%);
        background-size: 19px;
        background-position: center;
        background-repeat: no-repeat;
        background-color: rgb(138 221 58);
        border-radius: 45px;
    }

    .forcount {
        font-weight: 350;
        font-size: 13px;
        text-align: left;
        color: white;
        margin: 0 0 0 15px;
    }

    .moi-onoff-toggle-hub {
        position: absolute;
        display: inline-block;
        width: 50px;
        height: 24px;
        left: 10%;
        top: 63%;
    }

    .moi-toggle-button-hub {
        display: none;
    }

    .moi-toggle-slider-hub:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .6s;
    }

    .moi-toggle-slider-hub {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #2196f3;
        transition: .8s;
    }

    .moi-toggle-switch-hub input {
        display: none;
    }

    input:checked+.moi-toggle-slider-hub {
        background-color: white;
        border-radius: 34px;
        padding: 4px 25px 0 5px;
        font-size: 11px;
        font-weight: 600;
        color: rgb(73 159 243);
    }

    input:checked+.moi-toggle-slider-hub:before {
        transform: translateX(27px);
        background-color: rgb(73 159 243);
    }

    input:focus+.moi-toggle-slider-hub {
        box-shadow: 0 0 1px #2196F3;
    }

    .moi-toggle-slider-hub.round-hub {
        border-radius: 34px;
        padding: 4px 5px 0 22px;
        font-size: 11px;
        color: white;
        transform: translateX(0);
    }

    .moi-toggle-slider-hub.round-hub:before {
        border-radius: 50%;
    }

    .moi-toggle-button {
        display: none;
    }

    .gadget-streaming-moi-toggle-button {
        display: none;
    }

    .moi-toggle-slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .6s;
    }

    .moi-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #aaaaaa94;
        transition: .6s;
    }

    .moi-toggle-slider-cam {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #aaaaaa94;
        transition: .6s;
    }

    .moi-toggle-slider.beacon:before {
        width: 18px;
        height: 18px;
    }

    input:checked+.moi-toggle-slider.beacon:before {
        transform: translateX(30px);
        background-color: rgb(255, 181, 48);
    }

    .moi-toggle-switch input {
        display: none;
    }

    input:checked+.moi-toggle-slider {
        background-color: white;
        padding: 6px 25px 0 5px;
        font-size: 11px;
        font-weight: 600;
        color: rgb(60, 135, 65);
    }

    input:checked+.moi-toggle-slider.beacon {
        color: rgb(255, 181, 48);
    }

    input:checked+.moi-toggle-slider:before {
        transform: translateX(27px);
        background-color: rgb(60, 135, 65);
    }

    input:focus+.moi-toggle-slider {
        box-shadow: 0 0 1px #2196F3;
    }

    .moi-toggle-slider.round {
        border-radius: 34px;
        padding: 6px 5px 0 25px;
        font-size: 11px;
        color: white;
        transform: translateX(0);
    }

    .moi-toggle-slider.round:before {
        border-radius: 50%;
    }

    .gadget-streaming-moi-toggle-slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .6s;
    }

    .gadget-streaming-moi-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #aaaaaa94;
        transition: .6s;
    }

    .gadget-streaming-moi-toggle-slider.beacon:before {
        width: 18px;
        height: 18px;
    }

    input:checked+.gadget-streaming-moi-toggle-slider.beacon:before {
        transform: translateX(30px);
        background-color: rgb(255, 181, 48);
    }

    .gadget-streaming-moi-toggle-switch input {
        display: none;
    }

    input:checked+.gadget-streaming-moi-toggle-slider {
        background-color: white;
        padding: 4px 25px 0 5px;
        font-size: 11px;
        font-weight: 600;
        color: rgb(60, 135, 65);
    }

    input:checked+.gadget-streaming-moi-toggle-slider.beacon {
        color: rgb(255, 181, 48);
    }

    input:checked+.gadget-streaming-moi-toggle-slider:before {
        transform: translateX(27px);
        background-color: rgb(60, 135, 65);
    }

    input:focus+.gadget-streaming-moi-toggle-slider {
        box-shadow: 0 0 1px #2196F3;
    }

    .gadget-streaming-moi-toggle-slider.round {
        border-radius: 34px;
        padding: 4px 5px 0 25px;
        font-size: 11px;
        color: white;
        transform: translateX(0);
    }

    .gadget-streaming-moi-toggle-slider.round:before {
        border-radius: 50%;
    }
    .mediaplayer {
        width: 450px;
        height: 253px;
        border-radius: 10px 10px 0 0;
        outline: none;
    }

    .gadget_mediaplayer {
        width: 400px;
        height: 350px;
    }

    .remove_menu {
        background: rgb(39 201 189) !important;
        overflow: hidden;
        border: none !important;
        border-radius: 10px;
        padding: 12px;
        width: 30em;
        height: 10em;
        min-width: 30em;
        min-height: 10em;
        box-shadow: 11px 11px 20px #aaaaaa99;
    }

    .remove_items {
        width: 100%;
        height: 75%;
    }

    .filterItems {
        text-align: left !important;
        margin-left: 30px !important;
    }

    .firstSelectOption, .secondSelectOption, .thirdSelectOption{
        bottom: 50%;
        transform: translateY(-50%);
        margin-right: 10px !important;
    }

    .filter-content {
        overflow: scroll;
        max-height: 150px;
        text-align: left;
    }

    #tn {
        font-size: 25px
    }

    .filter-Reset-Button {
        display: inline-block;
        margin-left: 6.5em;
        width: 80px;
        height: 40px;
        border: 0;
        border-radius: .25em;
        background-color: #aaa;
        font-size: 1.0625em;
        color: #fff;
        font-weight: 500;
        cursor: pointer;
    }

    #close-button-remove {
        position: absolute;
        background-size: 13px !important;
        background-color: rgba(255 117 117) !important;
        background-image: url(../../public/static/location/imgs/close.svg);
        border-radius: 4px 4px 0 0!important;
        z-index: -1;
        height: 35px;
        width: 35px;
        background-repeat: no-repeat;
        background-position: center center;
        left: 91%;
        top: -17%;
        cursor: pointer;
    }

    #remove {
        position: absolute;
    }

    .removeContainer {
        text-align: right;
    }

    .removedone {
        border-color: rgb(73 159 243);
        font-size: 15px;
        width: 60px;
        height: 40px;
        cursor: pointer;
        border-radius: 15%;
        background-color: rgb(73 159 243);
        font-weight: 900;
        color: #333333;
        border-width: 1px;
        letter-spacing: 0.8px;
    }

    .removedone:hover {
        box-shadow: 2px 2px 3px #5f5959;
    }

    .loading-panel {
        height: 230px;
        width: 260px;
        margin-left: 130px;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        position: absolute;
        background-color: black;
        opacity: 0.8;
    }

    .loader {
        display: inline-block;
        position: absolute;
        width: 64px;
        height: 64px;
        margin-left: 60%;
        margin-top: 23%;
        opacity: 0.6;
        z-index: 4;
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
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .moi {
        font-weight: 900;
        font-size: large;
        color: white;
        position: absolute;
        margin-left: 50%;
        bottom: 35%;
    }

    .filter-checkbox {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .filter_menu {
        background: #f5f5f5 !important;
        overflow: hidden;
        border: none !important;
        border-radius: 10px;
        padding: 12px;
        width: 47em;
        height: 30em;
        min-width: 47em;
        min-height: 30em;
        box-shadow: 11px 11px 20px #aaaaaa99;
    }

    .ipcam-right-panel {
        position: absolute;
        right: 0;
        height: 253px;
        background-color: black;
        border-radius: 10px 10px 0 0;
    }

    .controlContainer {
        text-align: center;
        position: absolute;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
    }

    .reset {
        border-color: rgb(249 115 115);
        font-size: 15px;
        width: 60px;
        height: 40px;
        cursor: pointer;
        border-radius: 15%;
        background-color: rgb(249 115 115);
        font-weight: 900;
        color: #333333;
        margin: 5px;
        border-width: 1px;
        letter-spacing: 0.4px;
    }

    .reset:hover {
        box-shadow: 2px 2px 3px #5f5959;
    }

    .done {
        border-color: rgb(73 159 243);
        font-size: 15px;
        width: 60px;
        height: 40px;
        cursor: pointer;
        border-radius: 15%;
        background-color: rgb(73 159 243);
        font-weight: 900;
        color: #333333;
        margin: 5px;
        border-width: 1px;
        letter-spacing: 0.8px;
    }

    .done:hover {
        box-shadow: 2px 2px 3px #5f5959;
    }

    .beaconItem {
        transform: translateX(-50%);
        left: 50%;
        top: 100%;
        margin: 5px 0;
        position: absolute;
    }

    .beacon-filter-Reset-Button {
        display: inline-block;
        margin: 1em 5em 0 5em;
        width: 80px;
        height: 40px;
        border: 0;
        border-radius: .25em;
        background-color: #aaa;
        font-size: 1.0625em;
        color: #fff;
        font-weight: 500;
        cursor: pointer;
    }

    .filterBeacon {
        display: inline-block;
        position: relative;
        vertical-align: middle;
        width: 8em;
        height: 4em;
        cursor: pointer;
        margin: 10px 2px 25px;
    }

    .filterImg {
        display: inline-block;
        position: relative;
        vertical-align: middle;
        height: 50px;
        margin: 10px 15px;
        cursor: pointer;
    }

    .workerImg {
        height: 100%;
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
        height: 200px !important;
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
        margin: 138px 0 0 !important;
        text-align: center;
        margin-block-end: 0
    }

    .maptalks-menu .maptalks-menu-items li {
        background: rgb(73 169 243);
        padding-left: 5px;
        font-size: 12px;
        font-weight: 700;
        font-family: initial;
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

    .deviceText {
        width: 100%;
        height: 40px;
        text-align: center;
        font-size: 30px;
        color: white;
        opacity: 0.7;
        font-weight: 100;
        letter-spacing: 1px;
    }

    .addText {
        width: 100%;
        text-align: center;
        font-size: 40px;
        color: white;
        font-weight: 600;
        letter-spacing: 1px;
        margin: 8px 0 0 0;
    }

    .custom_menu {
        width: 250px;
        padding-top: 20px;
        background-color: rgb(138 221 58);
        border-radius: 10px;
        box-shadow: 11px 11px 20px #aaaaaa99;
    }

    .custom_menu .additem {
        width: 100%;
        margin-top: 8px;
        color: white !important;
        background: rgb(138 221 58);
        list-style: none;
        padding: 0;
        position: relative;
        text-align: center;
        -webkit-margin-after: 0;
        margin-block-end: 0;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        overflow: scroll;
        max-height: 280px;
    }

    .custom_menu .additem div {
        background: rgb(161 228 97);
        font-size: 20px;
        font-weight: 600;
        font-family: initial;
        letter-spacing: 0.6px;
        line-height: 45px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .custom_menu .additem div:hover {
        background: rgb(138 221 58);
        cursor: pointer
    }

    .custom_menu .additem div+div {
        border-top: 2px solid rgb(138 221 58);
    }

    .close-button {
        position: absolute;
        background-size: 13px !important;
        background-color: rgba(255 117 117) !important;
        background-image: url(../../public/static/location/imgs/close.svg);
        border-radius: 4px 4px 0 0!important;
        z-index: -1;
        height: 35px;
        width: 35px;
        background-repeat: no-repeat;
        background-position: center center;
        left: 90%;
        top: -9%;
        cursor: pointer;
    }

    .close-button-custom {
        position: absolute;
        background-size: 13px !important;
        background-color: rgba(255 117 117) !important;
        background-image: url(../../public/static/location/imgs/close.svg);
        border-radius: 4px 4px 0 0!important;
        z-index: -1;
        height: 30px;
        width: 35px;
        background-repeat: no-repeat;
        background-position: center center;
        left: 90%;
        top: -30px;
        cursor: pointer;
    }

    .close-button-filter {
        position: absolute;
        background-size: 13px !important;
        background-color: rgba(255 117 117) !important;
        background-image: url(../../public/static/location/imgs/close.svg);
        border-radius: 4px 4px 0 0!important;
        z-index: -1;
        height: 35px;
        width: 35px;
        background-repeat: no-repeat;
        background-position: center center;
        left: 91%;
        top: -8%;
        cursor: pointer;
    }

    .close-button-filter:hover {
        background-color: rgb(93 130 166) !important;
    }

    .close-button-custom:hover {
        background-color: rgb(93 130 166) !important;
    }

    .close-button:hover {
        background-color: rgb(93 130 166) !important;
    }

    .maptalks-msgBox a.maptalks-close {
        width: 25px !important;
        height: 25px !important;
        background-size: 13px !important;
        background-color: rgba(255, 87, 87, 1) !important;
        background-image: url(../../public/static/location/imgs/close.svg) !important;
        background-position: center center !important;
        border-radius: 4px 4px 0 0!important;
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

    .maptalks-menu .maptalks-menu-items li.maptalks-menu-splitter {
        height: 0 !important;
    }

    .ipcam_menu {
        width: 450px;
        height: 318px;
        list-style: none;
        padding: 0;
        margin-block-start: 0px !important;
        margin-block-end: 0 !important;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 11px 11px 20px #aaaaaa99;
    }

    .ipcam-container {
        top: 253px;
        height: 65px;
        width: 450px;
        position: absolute;
        background-color: rgb(60 135 65);
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }

    .ipcamId {
        width: 200px;
        height: 50px;
        margin-left: 20px;
        margin-top: 10px;
        color: white;
        overflow: hidden;
        font-weight: 900;
        font-size: large;
        position: absolute;
    }

    .ipcamKey {
        font-weight: 300;
        font-size: x-small;
    }

    .ipcamInfo {
        overflow-x: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }


    /*
    .ipcamContent {
        overflow-x: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    } */
    .normal-worker-info-panel {
        background-color: white;
        padding-inline-start: 0;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        height: 300px;
        overflow-x: none;
        overflow-y: scroll;
    }

    .normal-close-button-custom {
        position: absolute;
        background-size: 13px !important;
        background-color: rgba(255 117 117) !important;
        background-image: url(../../public/static/location/imgs/close.svg);
        border-radius: 4px 4px 0 0!important;
        z-index: -1;
        height: 30px;
        width: 35px;
        background-repeat: no-repeat;
        background-position: center center;
        left: 80%;
        top: -30px;
        cursor: pointer;
    }

    .worker_menu {
        width: 100%;
        height: 300px;
        list-style: none;
        padding: 0;
        text-align: center;
        margin-block-start: 0px !important;
        margin-block-end: 0 !important;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 11px 11px 20px #aaaaaa99;
    }

    .workerInfo {
        margin-left: 125px;
        background-color: white;
        padding-inline-start: 0;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        height: 300px;
        overflow-x: none;
        overflow-y: scroll;
    }

    .workerInfo-empty {
        width: 250px;
        padding-top: 100px;
        font-size: 20px;
        font-weight: 900;
        position: relative;
        color: black;
        background: white;
        list-style-type: none;
    }

    .workerId {
        width: 100px;
        height: 70px;
        margin: 20px 0px 0px 15px;
        color: white;
        text-align: left;
        overflow: hidden;
        font-weight: 900;
    }

    .workerCount {
        width: 125px;
        height: 40px;
        color: white;
        text-align: left;
        overflow: hidden;
        font-weight: 900;
        font-size: large;
    }

    .workerValue {
        width: 100px;
        height: 70px;
        margin: -2px 0px 0px 15px;
        color: white;
        overflow: hidden;
        text-align: left;
        font-weight: 900;
        letter-spacing: 1px;
    }

    .workerkey {
        font-weight: 350;
        font-size: 13px;
        padding-bottom: 5px;
        padding-top: 5px;
    }

    .workerInfo-content {
        position: relative;
        background: white;
        color: black;
        width: 225px;
        height: 46px;
        list-style-type: none;
        text-align: left;
        padding-left: 20px;
    }

    .workerInfo-wrapper {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    .workerInfo-name {
        font-size: 14px;
        font-weight: 900;
    }

    .workerInfo-time {
        font-size: 8px;
        color: rgba(0, 0, 0, 0.6);
    }

    .workerInfo-content:hover {
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

    .worker-status.lock-img {
        background-image: url(../../public/static/location/imgs/lock.svg);
        background-size: 30px;
        background-repeat: no-repeat;
        background-position: center;
        width: 30px;
        height: 30px;
        margin-left: 10%;
        margin-top: 70%;
    }

    .worker-status.unlock-img {
        background-image: url(../../public/static/location/imgs/unlock.svg);
        background-size: 30px;
        background-repeat: no-repeat;
        background-position: center;
        width: 30px;
        height: 30px;
        margin-left: 10%;
        margin-top: 70%;
    }

    .worker-status-ipcam.lock-img {
        background-image: url(../../public/static/location/imgs/lock.svg);
        background-size: 30px;
        background-repeat: no-repeat;
        background-position: 50%;
        width: 30px;
        height: 30px;
        left: 400px;
        top: 15px;
        z-index: 1;
        position: absolute;
    }

    .worker-status-ipcam.unlock-img {
        background-image: url(../../public/static/location/imgs/unlock.svg);
        background-size: 30px;
        background-repeat: no-repeat;
        background-position: center;
        width: 30px;
        height: 30px;
        left: 400px;
        top: 15px;
        z-index: 1;
        position: absolute;
    }

    .worker {
        height: 300px;
        width: 125px;
        margin-right: 230px;
        position: absolute;
        background-color: rgb(57 178 255);
        border-bottom-left-radius: 10px;
        border-top-left-radius: 10px;
        letter-spacing: 1px;
    }

    .scannerData {
        text-align: left;
        font-size: 13px;
        opacity: .5;
        margin-top: 10px;
    }

    .scannerNameList {
        overflow: scroll;
        text-align: left;
        opacity: .7;
        margin-top: 7px;
        height: 110px;
        width: 140px;
    }

    .scannerName {
        text-align: left;
        font-size: 13px;
        padding-right: 10px;
        font-weight: 900;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
    }

    .scannerNameList div+div {
        border-top: 10px solid rgb(249, 181, 49);
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
        box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.4);
        font-size: 14px;
        padding: 3px 5px;
        border-width: 0.5em 0 0.5em 0.5em;
        border-color: transparent transparent transparent white;
        -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
        filter: drop-shadow(1px 2px 1px #bcbcbc);
    }

    .extend-scannerNameList {
        height: 50px;
    }
    .beacon-moi-container {
        position: relative;
        width: 100%;
    }
    .top-speaker-container {
        box-shadow: 10px 10px 25px #aaaaaa;
        border-radius: 10px;
        overflow: hidden;
    }

    .speaker-left-container {
        width: 240px;
        height: 270px;
        color: black;
        font-weight: 500;
        background-color: rgb(250, 115, 120);
        font-size: large;
        position: absolute;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        letter-spacing: 1px;
        overflow: hidden;
    }

    .speakerName {
        text-align: left;
        font-size: 15px;
        padding-top: 25px;
        padding-bottom: 4px;
        opacity: .5;
        color: white;
        padding-left: 20px;
    }

    .speaker-name {
        text-align: left;
        font-size: 15px;
        padding-right: 10px;
        font-weight: 900;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: white;
        padding-left: 20px;
    }

    .speaker[title]:hover::after,
    .speaker[title]:focus::after {
        content: attr(title);
        position: absolute;
        transform: translate3d(0, 50%, 0);
        width: auto;
        white-space: nowrap;
        background: black;
        opacity: 0.7;
        color: #fff;
        border-radius: 2px;
        box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.4);
        font-size: 14px;
        padding: 3px 5px;
        border-width: 0.5em 0 0.5em 0.5em;
        border-color: transparent transparent transparent white;
        -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
        filter: drop-shadow(1px 2px 1px #bcbcbc);
    }

    .custom-speaker-button {
        height: 130px;
        overflow: scroll;
        text-align: left;
        margin-top: 30%;
        color: white;
        background-color: rgb(227 95 95);
    }

    .custom-speaker-button div+div {
        border-top: 3px solid rgb(250, 115, 120);
    }

    .mic-button {
        height: 40px;
        overflow: hidden;
        text-align: left;
        font-size: 15px;
        padding-left: 12px;
        font-weight: 900;
        white-space: nowrap;
        text-overflow: ellipsis;
        position: relative;
    }

    .mic-button-title {
        display: inline-block;
        position: absolute;
        top: 50%;
        cursor: pointer;
        transform: translateY(-50%);
    }

    .speaker-right-container {
        height: 270px;
        width: 300px;
        margin-left: 240px;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        background-color: white;
    }

    .speaker-stop-button {
        background-image: url('../../public/static/location/imgs/record-stop.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 25px;
        border-radius: 50%;
        display: inline-block;
        margin-left: 50% !important;
        width: 25px;
        height: 25px;
        cursor: pointer;
    }

    .speaker-on {
        background-image: url('../../public/static/location/imgs/speaker-on.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 40px;
        display: inline-block;
        position: absolute;
        width: 70px;
        height: 70px;
        margin-left: 25%;
        margin-top: 20%;
        background-color: gray;
        z-index: 4;
        border-radius: 80%;
        opacity: .7;
    }

    .speaker-off {
        background-image: url('../../public/static/location/imgs/speaker-off.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 40px;
        display: inline-block;
        position: absolute;
        width: 70px;
        height: 70px;
        margin-left: 25%;
        margin-top: 20%;
        background-color: gray;
        z-index: 4;
        border-radius: 80%;
        opacity: .7;
    }

    .playContainer {
        transform: translateY(-50%);
        top: 50%;
        position: absolute;
        margin-left: 40%;
        border-top: 0 !important;
    }

    .record-button {
        background-image: url('../../public/static/location/imgs/record-button.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 15px;
        display: inline-block;
        border-top: 0 !important;
        margin-left: 35%;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .broadcast-button {
        background-image: url('../../public/static/location/imgs/broadcast-button.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 15px;
        display: inline-block;
        border-top: 0 !important;
        margin-left: 35%;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .play-button {
        background-image: url('../../public/static/location/imgs/play-button.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 15px;
        display: inline-block;
        border-top: 0 !important;
        margin-left: 35%;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .pause-button {
        background-image: url('../../public/static/location/imgs/pause-button.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 15px;
        display: inline-block;
        border-top: 0 !important;
        margin-left: 11%;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .save-button {
        background-image: url('../../public/static/location/imgs/save-button.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 15px;
        display: inline-block;
        border-top: 0 !important;
        margin-left: 11%;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .speakerImg {
        height: 270px;
        width: 300px;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        background-color: white;
    }

    .speaker-close-button {
        position: absolute;
        background-size: 13px !important;
        background-color: rgba(255 117 117) !important;
        background-image: url(../../public/static/location/imgs/close.svg);
        border-radius: 4px 4px 0 0!important;
        z-index: -1;
        height: 35px;
        width: 35px;
        background-repeat: no-repeat;
        background-position: center center;
        left: 91%;
        top: -13%;
        cursor: pointer;
    }

    .bcns {
        box-shadow: 10px 10px 25px #aaaaaa;
        border-radius: 10px;
        overflow: hidden;
    }

    .bcnskey1{
        text-align: left;
        font-size: 15px;
        padding-top: 10px;
        opacity: .5;
    }

    .bcnsKey2{
        text-align: left;
        font-size: 12px;
        opacity: .5;
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

    .ipcam-remove-button {
        color: #ffffff;
        background-color: rgb(87 200 134);
        border: solid 1px #00BFFF;
        text-decoration: none;
        display: inline-block;
        cursor: pointer;
        margin-top: 15px;
        border-radius: 15px;
        line-height: initial !important;
    }

    .ipcam-remove-button:hover {
        color: #ffffff;
        background-color: rgb(42 180 240);
        border: solid 1px #00BFFF;
        text-decoration: none;
        display: inline-block;
        cursor: pointer;
        margin-top: 15px;
        border-radius: 15px;
        line-height: initial !important;
    }

    .ipcam-move-button {
        color: #ffffff;
        background-color: rgb(87 200 134);
        border: solid 1px #00BFFF;
        text-decoration: none;
        display: inline-block;
        cursor: pointer;
        margin-top: 20px;
        border-radius: 15px;
        line-height: initial !important;
    }

    .ipcam-move-button:hover {
        color: #ffffff;
        background-color: rgb(42 180 240);
        border: solid 1px #00BFFF;
        text-decoration: none;
        display: inline-block;
        cursor: pointer;
        margin-top: 20px;
        border-radius: 15px;
        line-height: initial !important;
    }

    .hubInfo {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 16px;
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
        opacity: 0.7;
        ;
        color: #fff;
        border-radius: 2px;
        box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.4);
        font-size: 14px;
        padding: 3px 5px;
        border-width: 0.5em 0 0.5em 0.5em;
        border-color: transparent transparent transparent white;
        -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
        filter: drop-shadow(1px 2px 1px #bcbcbc);
    }

    .bcnName1 {
        text-align: left;
        font-size: 15px;
        padding-right: 10px;
        opacity: .7;
        font-weight: 900;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .bcnName1[title]:hover::after,
    .bcnName1[title]:focus::after {
        content: attr(title);
        position: absolute;
        transform: translate3d(0, 50%, 0);
        width: auto;
        white-space: nowrap;
        background: black;
        opacity: 0.7;
        color: #fff;
        border-radius: 2px;
        box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.4);
        font-size: 14px;
        padding: 3px 5px;
        border-width: 0.5em 0 0.5em 0.5em;
        border-color: transparent transparent transparent white;
        -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
        filter: drop-shadow(1px 2px 1px #bcbcbc);
    }

    .bcnsImg1 {
        height: 350px;
        width: 400px;
    }

    .bcnsInfo1 {
        width: 150px;
        height: 350px;
        color: black;
        font-weight: 500;
        background-color: rgb(255, 181, 48);
        font-size: large;
        position: absolute;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        padding-left: 10px;
        letter-spacing: 1px;
    }

    .bcns-right-panel {
        height: 350px;
        width: 400px;
        margin-left: 150px;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        background-color: white;
    }
    .ipcam-content {
        height: 200px
    }

    .context-menu-container {
        width: 180px;
        height: auto;
        border-radius: 15px;
        color: white;
        overflow: hidden;
        box-shadow: 10px 10px 25px rgba(40, 40, 40, 0.3);
    }

    .context-menu-container.scanner {
        background-color: rgb(40, 160, 200);
    }

    .context-menu-container.ipcam {
        background-color: rgb(87 160 134);
    }

    .context-menu-container.speaker {
        background-color: rgb(250, 115, 120);
    }

    .context-menu-top-panel {
        position: relative;
        width: 100%;
        height: 60px;
    }

    .context-menu-text-wrapper {
        position: absolute;
        width: 100%;
        bottom: 5px;
        text-align: center;
    }

    .context-menu-type-text {
        font-size: 1em;
        font-weight: lighter;
    }

    .context-menu-name-text {
        font-size: 1.2em;
        font-weight: bold;
        margin-top: .5em;
    }

    .context-menu-bottom-panel {
        position: relative;
        width: 100%;
        height: auto;
    }

    .context-menu-button-frame {
        position: relative;
        width: 100%;
        height: 35px;
    }

    .context-menu-button-frame.scanner {
        background-color: rgb(60, 175, 200);
        border-top: thin solid rgb(40, 160, 200);
    }

    .context-menu-button-frame:active {
        background: #248ea5;
    }

    .context-menu-button-frame.ipcam {
        background-color: rgb(107, 175, 134);
        border-top: thin solid rgb(87, 160, 134);
    }

    .context-menu-button-frame.speaker {
        background-color: rgb(255, 140, 144);
        border-top: thin solid rgb(250, 115, 120)
    }

    .context-menu-button-frame.lock {
        display: none;
    }

    .context-menu-button-panel {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
    }

    .context-menu-button-text {
        text-align: center;
        font-size: 0.8em;
    }

    .gcContainer {
        width: 450px;
        background: rgb(85, 185, 250);
        opacity: 0.9;
        text-align: center;
        font-weight: bolder;
        border-radius: 8px;
        color: #333333;
        -webkit-box-shadow: 11px 11px 20px #aaaaaa99;
        box-shadow: 11px 11px 20px #aaaaaa99;
    }
    .gcTrContainer {

    }
    .gcTdFirstContainer {
        display: inline-block;
        width: 160px;
        padding: 5px;
    }
    .gcTdContainer {
        display: inline-block;
        width: 60px;
        padding: 5px;
    }
</style>
