<template>
    <div class="main-container">
        <div :id="id" v-if="isEmptyUrl">
        </div>
        <OnAir :isOnAir="onAir"></OnAir>
        <BeaconList v-if="showBeaconList" :isShow="showBeaconList" :showBeaconData="showBeaconData"
        :typeRange="tagKinds"></BeaconList>
        <SpeakerInfoWindow ref="infowindow" :item="speakerInfoWindowItems" :isForGroup="false"
            v-if="isShowingInfoWindow" :onAir="onAir"
            @select-close="handleInfoWindowClose"></SpeakerInfoWindow>
        <BasePointInfo :type="getCurrentType()" :id="currentTunnelId"
            @select-close-button="handleBasePointInfoCloseButton">
        </BasePointInfo>
        <TunnelInfo :type="getCurrentType()" :id="currentTunnelId"
            @select-close-button="handleTunnelInfoCloseButton">
        </TunnelInfo>
        <WorkInfo :type="getCurrentType()" :blastId="currentBlastId"
            :id="currentWorkId" :pauseList="getPauseList()"
            :operatorList="getOperatorList()" :equipmentList="getEquipmentList()"
            :workEquipmentList="workEquipmentList"
            @select-close-button="handleWorkInfoCloseButton">
        </WorkInfo>
        <BlastInfo :type="getCurrentType()" :id="currentBlastId"
            :workIdList="getWorkList()"
            :supportingIdList="getSupportingList()"
            :idleIdList="getIdleList()"
            @select-close-button="handleBlastInfoCloseButton"
            @select-ok-button="handleBlastInfoOkButton"
            @select-work-item="handleSelectWorkItem">
        </BlastInfo>
        <BlastInformation :type="getCurrentType()" :id="currentBlastId"
            @select-close-button="handleBlastInfoCloseButton">
        </BlastInformation>
    </div>
</template>

<script>
    import * as maptalks from 'maptalks'
    import * as beaconDetector from '@/services/beacon-detector';
    import SpeakerInfoWindow from '@/components/SpeakerInfoWindow';
    import OnAir from '@/components/OnAir';
    import BeaconList from '@/components/BeaconList';
    import util from '@/services/util';
    import { EventBus } from "../main";
    import { setTimeout, setInterval } from 'timers';
    import Hls from 'hls.js';
    import BasePointInfo from '@/components/BasePointInfo';
    import TunnelInfo from '@/components/TunnelInfo';
    import BlastInfo from '@/components/BlastInfo';
    import BlastInformation from '@/components/BlastInformation';
    import WorkInfo from '@/components/WorkInfo';
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
                routerLayer: '',
                contextCoordinate: null,
                infoWindow: null,
                hubInfoWindow: null,
                ipcamInfoWindow: null,
                speakerInfoWindow: null,
                routerInfoWindow: null,
                checkedMoiFilter: false,
                checkSpeakerFilter: false,
                checkRouterFilter: false,
                setIntervalData: {},
                gadgetCount: {},
                gadgetInfoWindow: null,
                gadgetInfoNumber: this._.keys(window.CONSTANTS.GADGET_INFO),
                bcnsData: {},
                drawnGadgetList: {},
                isRemoveAll: false,
                ipcamStreamData: {},
                onAir: false,
                showBeaconList: false,
                showBeaconData : {},
                markerMap: {
                    hubs: {},
                    cams: {},
                    speakers: {},
                    routers: {}
                },
                tags: {
                    xll: ['1', '2', '8'],
                    xl: ['3', '14', '15', '18', '19'],
                    l: ['4', '5', '6', '7', '9', '11', '20', '21']
                },
                tagKinds : [
                    '1', '2', '3', '14', '15', '18', '8', '19', '12', '17',
                    '4', '5', '6', '7', '100'
                ],
                //progress sector
                contextMenuItem: null,
                tunnelIDList: [],
                blastIDList: [],
                progIDList: [],
                workIDList: [],
                workEquipmentList: [],
                currentType: null,
                currentTunnelId: null,
                currentBaseId: null,
                currentTunnelType: null,
                currentBlastId: null,
                currentWorkId: null,
                currentBlastType: null,
                currentMarker: null,
                basePointLayers: {},  // {t_type: layer}
                tunnelLayers: {},  // {t_type: layer}
                blastLayers: {},  // {t_type : layer},
                basePointMarkers: {},  // {t_type: {bp_id: bp_marker}}
                tunnelMarkers: {},    // {t_type: {t_id: t_marker}}
                arrowMarkers: {},
                blastMarkers: {},  // {b_id: b_marker, ..}
                tunnelIdWithBase: {},
                blastIdWithTunnel: {},    // {t_id: [b_id, ..]}
                workIdWithBlast: {},    // {b_id: {0: [w_id, ..], 1: [w_id, ..], 2: [w_id, ..]}} 0(MainWork), 1(Supporting), 2(IdelTime)
                pauseIdWithWork: {},  // {w_id: [p_id, ..]}
                blastLayer: null,
                workLayer: null,
                colorMap: {
                    'selected': '#c2c2c2',
                    '0': '#a0a0ff',
                    '1': '#00aabb',
                    '3': '#5e5e5e',
                    '4': '#0000ff',
                    '100': '#219656',
                    '101': '#9f5900',
                    '102': '#7031a0',
                    '1000': '#219656',
                    '1001': '#9f5900',
                    '1002': '#7031a0',
                    'main' : '#ff0a01',
                    'supporting' : '#0f02ff',
                    'idle' : '#feff00'
                },
                tunnelOpacity: 0.4
            }
        },
        components: {
            SpeakerInfoWindow,
            OnAir,
            BeaconList,
            WorkInfo,
            BlastInfo,
            BlastInformation,
            BasePointInfo,
            TunnelInfo
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
                        this.hubPortalLayer = new maptalks.VectorLayer('vector31').addTo(this.map);
                        this.hubAT1Layer = new maptalks.VectorLayer('vector32').addTo(this.map);
                        this.hubAT2Layer = new maptalks.VectorLayer('vector33').addTo(this.map);
                        this.lostTagHubLayer = new maptalks.VectorLayer('vector38').addTo(this.map);
                        this._.forEach(this.gadgetInfoNumber, (index) => {
                            this.workerLayer[index] = new maptalks.VectorLayer(`vector${ index }`).addTo(this.map);
                            this.workerLayer[index].setZIndex(1);
                        })
                        this.lostTagWorkerLayer = new maptalks.VectorLayer('vector30').addTo(this.map);
                        this.lostTagWorkerLayer.setZIndex(1);
                        this.noGroupSpeakerkLayer = new maptalks.VectorLayer('speakerVector4').addTo(this.map);
                        this.hubPortalLayer.setZIndex(3);
                        this.hubAT1Layer.setZIndex(3);
                        this.hubAT2Layer.setZIndex(3);
                        this.lostTagHubLayer.setZIndex(3);
                        this.camFixedLayer = new maptalks.VectorLayer('vector35').addTo(this.map);
                        this.camMobileLayer = new maptalks.VectorLayer('vector36').addTo(this.map);
                        this.lostTagCamLayer = new maptalks.VectorLayer('vector37').addTo(this.map);
                        this.routerLayer = new maptalks.VectorLayer('vector39').addTo(this.map);
                        this.routerLayer.setZIndex(3);
                        this.lostTagCamLayer.setZIndex(3);
                        this.camMobileLayer.setZIndex(3);
                        this.camFixedLayer.setZIndex(3);
                        this.noGroupSpeakerkLayer.setZIndex(3);
                        this._.forEach(window.CONSTANTS.TUNNEL_TYPE, (value, key) => {
                            this.tunnelLayers[value] = new maptalks.VectorLayer(value).addTo(this.map);
                            this.tunnelLayers[value].setZIndex(1);
                            this.tunnelMarkers[value] = {};
                            this.blastLayers[value] = new maptalks.VectorLayer('p' + value).addTo(this.map);
                            this.blastLayers[value].setZIndex(1);

                            this.basePointLayers[value] = new maptalks.VectorLayer('b' + value).addTo(this.map);
                            this.basePointLayers[value].setZIndex(0);
                            this.basePointMarkers[value] = {};
                        });
                        this._getActivityList();
                        this._getEquipmentList();
                        this._getOperatorList();
                        //TODO:
                        this._getMessageList();
                        this._getTeamList();
                        this._getEquipmentInfoList();
                        this._getChargingList();
                        this._getBlastingList();
                        this._getBasePointList();
                        this.blastLayer = new maptalks.VectorLayer('vector40').addTo(this.map);
                        this.blastLayer.setZIndex(2);
                        this.workLayer = new maptalks.VectorLayer('vector41').addTo(this.map);
                        this.workLayer.setZIndex(101);
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
                    });
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
                            <div id="scanneritem">Add Scanner</div>
                            <div id="camitem">Add Ipcam</div>
                            <div id="speakeritem">Add Speaker</div>
                            <div id="routeritem">Add Router</div>
                            </div></div>`,
                        dx: -75,
                        animation: 'fade'
                    };
                    this.map.on('contextmenu', (e) => {
                        this.contextCoordinate = e.coordinate;
                        this.map.closeMenu();
                        this.map.closeMenu();
                        this.map.setMenu(this.contextMenuOption).openMenu(e.coordinate);

                        document.getElementById('scanneritem').onclick = () => {
                            this.handleAddItem(window.CONSTANTS.PRODUCT_KIND.HUB, e.coordinate);
                        }
                        document.getElementById('camitem').onclick = () => {
                            this.handleAddItem(window.CONSTANTS.PRODUCT_KIND.IPCAM, e.coordinate);
                        }
                        document.getElementById('speakeritem').onclick = () => {
                            this.handleAddItem(window.CONSTANTS.PRODUCT_KIND.SPEAKER, e.coordinate);
                        }
                        document.getElementById('routeritem').onclick = () => {
                            this.handleAddItem(window.CONSTANTS.PRODUCT_KIND.ROUTER, e.coordinate);
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
                    } else if (kind === window.CONSTANTS.PRODUCT_KIND.ROUTER)  {
                        drawMethod = this.drawRouter;
                    }
                    if (!!drawMethod) {
                        drawMethod(id, coordinate, false, true);
                    }
                });
            },
            showItemList(kind, coordinate, selectedCallback) {
                let list = null,
                    kindName = '',
                    markers = {};
                if (kind === window.CONSTANTS.PRODUCT_KIND.HUB) {
                    list = this.$store.getters.getHubs;
                    kindName = 'Scanner';
                    markers = this.markerMap.hubs;
                } else if (kind === window.CONSTANTS.PRODUCT_KIND.IPCAM) {
                    list = this.$store.getters.getIpCams;
                    kindName = 'IPcam';
                    markers = this.markerMap.cams;
                } else if (kind === window.CONSTANTS.PRODUCT_KIND.SPEAKER)  {
                    list = this.$store.getters.getSpeakers;
                    kindName = 'Speaker';
                    markers = this.markerMap.speakers;
                } else if (kind === window.CONSTANTS.PRODUCT_KIND.ROUTER)  {
                    list = this.$store.getters.getRouters;
                    kindName = 'Router';
                    markers = this.markerMap.routers;
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

                    //TODO: 디텍트 된 비콘들의 개수를 허브 위치에 숫자로 표현 가능, overlap, 겹침
                    // this._.forEach(this.markerMap.hubs, (marker, hid) => {
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
                            hub.custom.lock = true;
                            this.$store.commit('addHub', hub);
                            if (!this._.isEmpty(hub.custom) && !this._.isEmpty(hub.custom.map_location)) {
                                this.drawHub(hub.id, hub.custom.map_location, true, true);
                            }
                        });
                        this.loadDetectedGadgets();
                    });
                });
                this.services.getIpcams((ipcams) => {
                    console.log("Success to get Ipcams", ipcams);
                    this._.forEach(ipcams, ipcam => {
                        ipcam.custom.lock = true;
                        this.$store.commit('addIpcam', ipcam);
                    });
                    this.drawIpCams(ipcams, true, true);
                });

                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                    this.services.getGroupData(groups => { //TODO: group에 따른 speaker layer을 생성할 수 있게 함
                        console.log("Sucess to get Groups", groups);
                        this._.forEach(groups, group => {
                            // this.addGroupLayer(group.id);
                            this.$store.commit('addGroup', group);
                        })

                        // this.services.getSpeakers(speakers => {
                        //     console.log("Sucesss to get Speakers", speakers);
                        //     this._.forEach(speakers, speaker => {
                        //         this.$store.commit('addSpeaker', speaker);
                        //     })
                        //     this.drawSpeakers(speakers);
                        // });
                        this.services.getPaStatus(info => {
                            if (Object.keys(info).length == 0) {
                                this.onAir = false;
                                this.$store.commit('updateStreamingStatus', false);
                                this.$store.commit('updateNowPlaying', window.CONSTANTS.PLAY_STATUS.READY_FOR_STREAM)
                            } else {
                                this.onAir = true;
                                this.$store.commit('updateStreamingStatus', true);
                                this.$store.commit('updateNowPlaying', window.CONSTANTS.PLAY_STATUS.OTHER_STREAM)
                            }
                        }, (error) => {
                            console.log("Failed to get pa status.", error);
                        });
                    }, (error) => {
                        console.log("Failed to get Groups", error);
                    });

                    this.services.getSpeakers(speakers => {
                        console.log("Sucesss to get Speakers", speakers);
                        this._.forEach(speakers, speaker => {
                            speaker.custom.lock = true;
                            this.$store.commit('addSpeaker', speaker);
                        })
                        this.drawSpeakers(speakers, true, true);
                    });

                    this.services.getRouters(routers => {
                        console.log("Sucesss to get Routers", routers);
                        this._.forEach(routers, router => {
                            router.custom.lock = true;
                            this.$store.commit('addRouter', router);
                        })
                        this.drawRouters(routers, true, true);
                    });

                    this.services.getAlarmList(alarms => {
                        console.log("Sucess to get Alarms", alarms);
                        this._.forEach(alarms, (alarm) => {
                            this.$store.commit('addAlarms', alarm);
                        })
                    }, (error) => {
                        console.log("Failed to get Alarms", error);
                    });

                    this.services.getStreamStatus(data => {
                        if (Object.keys(data).length == 0) {
                            this.$store.commit('updateStreamingStatus', false)
                            this.$store.commit('updateNowPlaying', window.CONSTANTS.PLAY_STATUS.READY_FOR_STREAM)
                            this.onAir = false;
                        } else {
                            this.$store.commit('updateStreamingStatus', true)
                            this.$store.commit('updateNowPlaying', window.CONSTANTS.PLAY_STATUS.OTHER_STREAM)
                            this.onAir = true;
                            EventBus.$emit("g-streaming-status", {"status": true});
                        }
                    }, (error) => {
                        console.log("Failed to get stream data");
                    });
                }
            },
            addGroupLayer(id) {
                if (!this._.has(this.speakerLayer, id)) {
                    this.speakerLayer[id] = new maptalks.VectorLayer(`speaker${ id }vector`).addTo(this.map);
                }
            },
            handleInfoWindowClose() {
                this.speakerInfoWindowItems = {};
            },
            drawHub(hubId, coordinate, isUpdatedData, initData) {
                let marker = null,
                    hubData = this.$store.getters.getHub(hubId),
                    draggable = null;

                if (initData) {
                    hubData.custom.lock = true;
                }

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
                    } else if (kind === window.CONSTANTS.PRODUCT_KIND.ROUTER) {
                        data = this.$store.getters.getRouter(id);
                        marker = this.markerMap.routers[id];
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
                    try {
                        beacon.custom.map_location.x = coordinate.x + xPosition;
                        beacon.custom.map_location.y = coordinate.y + (yPosition * (0.4));
                    } catch(e) {
                        beacon.custom.map_location = {};
                        beacon.custom.map_location.x = coordinate.x + xPosition;
                        beacon.custom.map_location.y = coordinate.y + (yPosition * (0.4));
                    }
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
                        customLayer = this.workerLayer[tag];
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
                    tag = this._.first(gadget.tags);
                    gadgetKind = window.CONSTANTS.GADGET_INFO[tag];
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
            drawIpCams(camList, isUpdatedData, initData) {
                this._.forEach(camList, (ipcam) => {
                    if (!this._.isEmpty(ipcam.custom) && !this._.isEmpty(ipcam.custom.map_location)) {
                        this.drawIpcam(ipcam.id, ipcam.custom.map_location, isUpdatedData, initData);
                    }
                });
            },
            drawIpcam(ipcamId, coordinate, isUpdatedData, initData) {
                // console.debug('Try draw ipcam, id: ', ipcamId);
                let marker = null,
                    draggable = null,
                    customLayer = null;;
                var ipcamData = this.$store.getters.getIpCam(ipcamId);
                // this.setBaseZoomLv();
                if (initData) {
                    ipcamData.custom.lock = true;
                }

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
                            ipcamData.lock = true;
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
            drawSpeakers(speakerList, isUpdatedData, initData) {
                this._.forEach(speakerList, (speaker) => {
                    if (!this._.isEmpty(speaker.custom) && !this._.isEmpty(speaker.custom.map_location)) {
                        this.drawSpeaker(speaker.id, speaker.custom.map_location, isUpdatedData, initData);
                    }
                });
            },
            drawSpeaker(speakerId, coordinate, isUpdatedData, initData) {
                // console.debug('Try draw ipcam, id: ', ipcamId);
                let marker = null,
                    draggable = null,
                    speakerData = this.$store.getters.getSpeaker(speakerId),
                    groupData = this.$store.getters.getGroupList;
                //TODO
                // this.setBaseZoomLv();
                let fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }speaker.svg`; // if changed, declare const
                if (!speakerData.status) {
                    fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }speaker-offline.png`;
                }
                if (initData) {
                    speakerData.custom.lock = true;
                }

                if (this._.has(this.markerMap.speakers, speakerId)) {
                    if (!(this.markerMap.speakers[speakerId]._coordinates.x === coordinate.x) && !(this.markerMap.speakers[speakerId]._coordinates.y === coordinate.y)) {
                        marker = this.markerMap.speakers[speakerId];
                        marker.removeInfoWindow();
                        marker.setCoordinates(coordinate);
                        this.markerMap.speakers[speakerId] = marker;
                    }
                } else {
                    draggable = this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN) && !speakerData.custom.lock;
                    marker = new maptalks.Marker(
                        [coordinate.x, coordinate.y], {
                            'symbol': {
                                markerFile: fileUrl,
                                markerWidth: this.markerWidth,
                                markerHeight: this.markerHeight
                            },
                            draggable: draggable
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
            removeSpeakerMarker(id) {
                let marker = this.markerMap.speakers[id];
                if (!!marker) {
                    let speaker = this.$store.getters.getSpeaker(id);
                    marker.remove();
                    if (!!speaker && !!speaker.custom.map_location) {
                        delete speaker.custom.map_location;
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
            removeRouterMarker(id) {
                let marker = this.markerMap.routers[id];
                if (!!marker) {
                    let router = this.$store.getters.getRouter(id);
                    marker.remove();
                    if (!!router && !!router.custom.map_location) {
                        delete router.custom.map_location;
                        delete this.markerMap.routers[id];
                        //TODO: change
                        this.$store.commit('updateRouterData', router);
                        this._updateData([router], 'router', (failedIdList) => { //TODO
                            if (!this._.isEmpty(failedIdList)) {
                                this.sweetbox.fire('Sorry, router remove failed');
                            }
                        });
                    } else {
                        console.warn(`Failed to clear router location, cannot found router model by given id: ${ id }`);
                    }
                }
            },
            drawRouters(routerList, isUpdatedData, initData) {
                this._.forEach(routerList, (router) => {
                    if (!this._.isEmpty(router.custom) && !this._.isEmpty(router.custom.map_location)) {
                        this.drawRouter(router.id, router.custom.map_location, isUpdatedData, initData);
                    }
                });
            },
            drawRouter(routerId, coordinate, isUpdatedData, initData) {
                //console.debug('Try draw router, id: ', routerId);
                let marker = null,
                    draggable = null,
                    routerData = this.$store.getters.getRouter(routerId);
                let fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }router.svg`; // if changed, declare const
                if (!routerData.status) {
                    fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }router-offline.png`;
                }

                if (initData) {
                    routerData.custom.lock = true;
                }
                if (this._.has(this.markerMap.routers, routerId)) {
                    if (!(this.markerMap.routers[routerId]._coordinates.x === coordinate.x) && !(this.markerMap.routers[routerId]._coordinates.y === coordinate.y)) {
                        marker = this.markerMap.routers[routerId];
                        marker.removeInfoWindow();
                        marker.setCoordinates(coordinate);
                        this.markerMap.routers[routerId] = marker;
                    }
                } else {
                    draggable = this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN) && !routerData.custom.lock;
                    marker = new maptalks.Marker(
                        [coordinate.x, coordinate.y], {
                            'symbol': {
                                markerFile: fileUrl,
                                markerWidth: this.markerWidth,
                                markerHeight: this.markerHeight
                            },
                            draggable: draggable
                        }
                    )
                    let tagData = this._.first(routerData.tags),
                        customLayer = this.routerLayer;
                    marker.addTo(customLayer);
                    marker.on('click', (e) => {
                        e.domEvent.stopPropagation();
                        marker.closeInfoWindow();
                        this.showRouterWindow(routerId, marker);
                    });
                    this.markerMap.routers[routerId] = marker;
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        marker.on('contextmenu', () => {
                            marker.closeInfoWindow();
                            this.showContextMenu(routerId, 3, marker);
                        });
                        marker.on('dragstart', () => {
                            marker.closeInfoWindow();
                        });
                        marker.on('dragend', (e) => {
                            const routerMarkerLocation = this.markerMap.routers[routerId]._coordinates;
                            routerData.custom.map_location = {
                                x: routerMarkerLocation.x,
                                y: routerMarkerLocation.y
                            }
                            this.$store.commit('updateRouterData', routerData);

                            if (!this._.has(this.setIntervalData, routerId)) {
                                this.setLocationTimeOut(routerId, 'router');
                            }
                        });
                        routerData.custom.map_location = {
                            x: coordinate.x,
                            y: coordinate.y
                        }
                        if (!isUpdatedData) {
                            this._updateData([routerData], 'router', (failedList) => {
                                if (!this._.isEmpty(failedList)) {
                                    this.sweetbox.fire('Sorry, router location update failed');
                                }
                                this.$store.commit('updateRouterData', routerData);
                            });
                        }
                    }
                }
            },
            showRouterWindow(routerId, marker) {
                let routerData = this.$store.getters.getRouter(routerId);

                if(!this._.isEmpty(this.infoWindow)) {
                    this.infoWindow.remove();
                }
                if (!!this.routerInfoWindow) {
                    marker.removeInfoWindow();
                    this.routerInfoWindow = null;
                }
                marker.setInfoWindow({ // TODO: vue component
                    content: `<div class="routerInfo">
                                <div class="routerContainer">
                                    <div class="routerSubContainer">
                                      <div class="routerSubTitle">Name</div>
                                      <div class="routerSubValue">${ routerData.name }</div>
                                    </div>
                                    <div class="routerSubContainer">
                                      <div class="routerSubTitle">IP Address</div>
                                      <div class="routerSubValue">${ routerData.custom.ip }</div>
                                    </div>
                                    <div class="router-status"></div>
                                </div>
                                <div class="router-close-button-custom"></div>
                              </div>`,
                    width: 350,
                    custom: true,
                    autoPan: false,
                    dy: -15  // TODO:  before -300
                });
                marker.openInfoWindow();
                if (routerData.custom.lock) {
                    document.getElementsByClassName('router-status')[0].classList.add('lock-img');
                } else {
                    document.getElementsByClassName('router-status')[0].classList.add('unlock-img');
                }
                this.routerInfoWindow = {
                    id: routerId,
                    item: marker._infoWindow
                };

                this._.last(document.getElementsByClassName('router-close-button-custom')).onclick = () => {
                    marker.removeInfoWindow();
                }
                this.routerInfoWindow.item.on('remove', () => {
                    if (!!this.routerInfoWindow) {
                        this.routerInfoWindow = null;
                    }
                })
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
                context += `<div><button id="beacon-filter-Selectall-Button" class="beacon-filter-Selectall-Button">Select All</button>`;
                context += `<button id="beacon-filter-Reset-Button" class="beacon-filter-Reset-Button">Reset</button></div>`;

                this.sweetbox.fire({
                    showCancelButton: false,
                    showConfirmButton: false,
                    showCloseButton: true,
                    titleText: 'Choose the beacon to filter',
                    html: context,
                    width: 600
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

                document.getElementById('beacon-filter-Selectall-Button').onclick = () => {
                    this._.forEach(this.gadgetInfoNumber, (index) => {
                        document.getElementById(`beacon-${ index }`).checked = 1;
                        this.workerLayer[index].show();
                    })
                }
            },
            choiceFilter() {
                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
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
                        <button id="filterItemRouter" class="filterRouterIcon"></button>
                        <div class="infoFilterRouter">Router</div>
                        <button id="filterItemMoi" class="filterMoiIcon"></button>
                        <div class="infoFilterMoi">MOI</div>`,
                        showCancelButton: false,
                        showConfirmButton: true,
                        confirmButtonColor: '#3085d6',
                        showCloseButton: true,
                        width: 650
                    })
                } else {
                    this.sweetbox.fire({
                        titleText: 'Choose the item to filter',
                        html: `<button id="filterItemGadget" class="filterGadgetIcon"></button>
                        <div class="infoFilterGadget">Equipment</div>
                        <button id="filterItemHub" class="filterHubIcon"></button>
                        <div class="infoFilterHub">Beacon Scanner</div>
                        <button id="filterItemIpcam" class="filterIpcamIcon"></button>
                        <div class="infoFilterIpcam">IPCam</div>
                        <button id="filterItemMoi" class="filterMoiIcon"></button>
                        <div class="infoFilterMoi">MOI</div>`,
                        showCancelButton: false,
                        showConfirmButton: true,
                        confirmButtonColor: '#3085d6',
                        showCloseButton: true,
                        width: 650
                    })
                }
                if (this.checkedMoiFilter) {
                   document.getElementsByClassName('filterMoiIcon')[0].classList.add('moiFilter');
                }
                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                    if (this.checkSpeakerFilter) {
                        document.getElementsByClassName('filterSpeakerIcon')[0].classList.add('speakerFilter');
                    }
                    if (this.checkRouterFilter) {
                        document.getElementsByClassName('filterRouterIcon')[0].classList.add('routerFilter');
                    }
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
                if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
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
                    }
                    document.getElementsByClassName('filterRouterIcon')[0].onclick = () => {
                        this.checkRouterFilter = !this.checkRouterFilter;
                        if (this.checkRouterFilter) {
                            this.routerLayer.hide();
                            document.getElementsByClassName('filterRouterIcon')[0].classList.add('routerFilter');
                        } else {
                            this.routerLayer.show();
                            document.getElementsByClassName('filterRouterIcon')[0].classList.remove('routerFilter');
                        }
                    }
                }
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
                            <button id="filter-Selectall-Button" class="filter-Selectall-Button">Select All</button>
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
                            <button id="filter-Selectall-Button" class="filter-Selectall-Button">Select All</button>
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
                    document.getElementById('filter-Selectall-Button').onclick = () => {
                        document.getElementsByClassName(`item${ type }-${ type }`)[0].checked = 1;
                        document.getElementsByClassName(`item${ type }-${ type + 1 }`)[0].checked = 1;
                        layers.firstOption.show();
                        layers.secondOption.show();
                        if (!!document.getElementsByClassName(`item${ type }-${ type + 2 }`)[0]) {
                            document.getElementsByClassName(`item${ type }-${ type + 2 }`)[0].checked = 1;
                            layers.thirdOption.show();
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
                        _type = 'Speaker';
                        if (!!data) {
                            _name = data.name;
                        }
                        _removeMethod = this.removeSpeakerMarker;
                        break;
                    case window.CONSTANTS.CONTEXT_TYPE.ROUTER:
                        data = this.$store.getters.getRouter(id);
                        _type = 'Router';
                        if (!!data) {
                            _name = data.name;
                        }
                        _removeMethod = this.removeRouterMarker;
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
                        case window.CONSTANTS.CONTEXT_TYPE.SPEAKER:
                            this.$store.commit('updateSpeakerData', data);
                            this._updateData([data], 'speaker', (failedList) => {});
                        break;
                        case window.CONSTANTS.CONTEXT_TYPE.ROUTER:
                            this.$store.commit('updateRouterData', data);
                            this._updateData([data], 'router', (failedList) => {});
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
                        this.removeRouterItems();
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
            removeRouterItems() {
                let routerList = [];
                this._.forEach(this.markerMap.routers, (marker, routerId) => {
                    let router = this._.cloneDeep(this.$store.getters.getRouter(routerId));
                    if (!this._.isEMpty(router)) {
                        delete router.custom.map_location;
                        this.$store.commit('updateRouterData', router);
                        this.markerMap.routers[routerId].remove();
                        delete this.markerMap.routers[routerId];
                        routerList.push(router);
                    }
                });
                if (!!routerList) {
                    this._updateData(routerList, 'router', (failedIdList) => {
                        console.debug("Succedd to remove router data");
                    })

                    this._.forEach(this.markerMap.routers, (marker, routerId) => {
                        this.removeRouterMarker(routerId);
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
                        if (imgElement !== null) {
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
                // sortData = _.reverse(sortData);
                sortData = sortData.reverse();
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
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        this._handleAddSpeaker(data.v);
                    }
                } else if (this.isRouter(data.kind)) {
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        this._handleAddRouter(data.v);
                    }
                } else {
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        this._handleAddAlarm(data.v);
                    }
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
            _handleAddRouter(data) {
                this.$store.commit('addRouter', data);
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
                } else if (this.isSpeaker(data.kind)) {
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        this._handleUpdatedSpeaker(data.v); //스피커 업데이트
                    }
                } else if (this.isRouter(data.kind)) {
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        this._handleUpdatedRouter(data.v); //스피커 업데이트
                    }
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
            },
            _handleUpdatedRouter(data) {
                let routerMarker = this.markerMap.routers[data.id],
                    routerData = this._.cloneDeep(this.$store.getters.getRouter(data.id));

                this._.extend(routerData, data);
                this.$store.commit('updateRouterData', routerData);

                if (!!data.custom) {
                    if (this._.has(data.custom, 'map_location')) {
                        this.drawRouter(data.id, data.custom.map_location, true);
                    } else {
                        if (!!routerMarker) {
                            routerMarker.remove();
                            delete this.markerMap.routers[data.id];
                        }
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
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        this._handleSpeakerRemoved(data.v);
                    }
                } else if (this.isRouter(data.kind)) {
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        this._handleRouterRemoved(data.v);
                    }
                } else {
                    if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                        this._handleAlarmRemoved(data.v);
                    }
                }
            },
            _handleHubRemoved(data) {
                this.$store.commit('removeHub', data.id);
                this.removeHubMarker(data.id);
            },
            _handleIpcamRemoved(data) {
                this.$store.commit('removeIpcam', data.id);
                this.removeIpcamMarker(data.id);
            },
            _handleGadgetRemoved(data) {
                this.$store.commit('removeGadget', data.id)
                this.removeGadget(data.id);
            },
            _handleSpeakerRemoved(data) {
                this.$store.commit('removeSpeaker', data.id);
                this.removeSpeakerMarker(data.id);
            },
            _handleRouterRemoved(data) {
                this.$store.commit('removeRouter', data.id);
                this.removeRouterMarker(data.id);
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
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            this._handleSpeakerOnline(data.v);
                        }
                    break;
                    case window.CONSTANTS.PRODUCT_KIND.ROUTER:
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            this._handleRouterOnline(data.v);
                        }
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
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            this._handleSpeakerOffline(data.v);
                        }
                    break;
                    case window.CONSTANTS.PRODUCT_KIND.ROUTER:
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            this._handleRouterOffline(data.v);
                        }
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
            _handleRouterOnline(data) {
                let routerMarker = this.markerMap.routers[data.id],
                    routerData = this._.clone(this.$store.getters.getRouter(data.id));
                routerData.status = 1;
                this.$store.commit('updateRouterData', routerData);
                if (!!routerMarker) {
                    routerMarker.updateSymbol({
                        markerFile: `${ window.CONSTANTS.URL.BASE_IMG }router.svg`
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
            _handleRouterOffline(data) {
                let routerMarker = this.markerMap.routers[data.id],
                    routerData = this._.clone(this.$store.getters.getRouter(data.id));
                routerData.status = 0;
                this.$store.commit('updateRouterData', routerData);
                if (!!routerMarker) {
                    routerMarker.updateSymbol({
                        markerFile: `${ window.CONSTANTS.URL.BASE_IMG }router-offline.png`
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
                // const list = data.v;
                // if (data.kind === 'add') {
                // } else if (data.kind === 'remove') {
                // } else if (data.kind === 'update') {
                // }
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
                const isStatus = data.v.status,
                      nowStatus = this.$store.getters.getNowPlaying;
                this.onAir = isStatus;
                EventBus.$emit("g-streaming-status", {"status": isStatus});
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
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            this._handleReopenStream(data.v);
                        }
                    },
                    updateAlarmList: (data) => {
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            this._handleUpdateAlarmList(data);
                        }
                    },
                    updateGroupList: (data) => {
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            this._handleUpdateGroupList(data);
                        }
                    },
                    updateStreamingStatus: (data) => {
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            this._handleStreamingStatus(data);
                        }
                    },
                    failedList: (data) => {
                        if (this.isShowingByStage(window.CONSTANTS.USER_STAGE.SK_ADMIN)) {
                            this._handleFailedList(data);
                        }
                    },
                    updateBasePointList: (data) => {
                        this._handleUpdateBasePointList(data);
                    },
                    updateTunnelList: (data) => {
                        this._handleUpdateTunnelList(data);
                    },
                    updateBlastList: (data) => {
                        this._handleUpdateBlastList(data);
                    },
                    updateBlastInfoList: (data) => {
                        this._handleUpdateBlastInfoList(data);
                    },
                    updateWorkList: (data) => {
                        this._handleUpdateWorkList(data);
                    },
                    updateWorkHistoryList: (data) => {
                        this._handleUpdateWorkHistoryList(data);
                    },
                    updatePauseHistoryList: (data) => {
                        this._handleUpdatePauseHistoryList(data);
                    },
                    updateWorkOperatorList: (data) => {
                        this._handleUpdateWorkOperatorList(data);
                    },
                    updateWorkEquipmentList: (data) => {
                        this._handleUpdateWorkEquipmentList(data);
                    },
                    updateMessageList: (data) => {
                        this._handleUpdateMessageList(data);
                    },
                    updateTeamList: (data) => {
                        this._handleUpdateTeamList(data);
                    },
                    updateChargingList: (data) => {
                        this._handleUpdateChargingList(data);
                    },
                    updateBlastingList: (data) => {
                        this._handleUpdateBlastingList(data);
                    },
                });
            },
            _handleUpdateBasePointList(data) {
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        let basePoint = this.$store.getters.getBasePoint(item.id);
                        if (basePoint === null || basePoint === undefined) {
                            this.tunnelIdWithBase[item.id] = [];
                            this._drawBasePoint(item);
                        }
                        this.$store.commit('addBasePoint', item);
                    } else if (data.kind === 'remove') {
                        let basePoint = this.$store.getters.getBasePoint(item),
                            typ = window.CONSTANTS.TUNNEL_TYPE.BASEPOINT;
                        if (basePoint !== null || basePoint !== undefined) {
                            let basePointMarker = this.basePointMarkers[typ][item];
                            basePointMarker.remove();
                            delete this.tunnelIdWithBase[item]
                            delete this.basePointMarkers[typ][item];
                            this.$store.commit('removeBasePoint', item);
                        }
                    } else if (data.kind === 'update') {
                        let basePoint = this.$store.getters.getBasePoint(item.id);
                        // this._fixDrawTunnel(item);
                        // this.$store.commit('updateTunnel', item);
                    }
                });
            },
            _handleUpdateTunnelList(data) {
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        let tunnel = this.$store.getters.getTunnel(item.id);
                        if (tunnel === null || tunnel === undefined) {
                            this.tunnelIdWithBase[item.basepoint_id].push(item.id)
                            this._drawTunnel(item);
                        }
                        this.$store.commit('addTunnel', item);
                    } else if (data.kind === 'remove') {
                        let tunnel = this.$store.getters.getTunnel(item),
                            basepointId = tunnel.basepoint_id,
                            typ = tunnel.category;
                        if (tunnel !== null || tunnel !== undefined) {
                            let tunnelMarker = this.tunnelMarkers[typ][item];
                            tunnelMarker.remove();
                            this.tunnelIdWithBase[basepointId] = this._.without(this.tunnelIdWithBase[basepointId], item);
                            delete this.tunnelMarkers[typ][item];
                            let arrowMarker = this.arrowMarkers[item];
                            arrowMarker.remove()
                            delete this.arrowMarkers[item];
                            this.$store.commit('removeTunnel', item);
                        }
                    } else if (data.kind === 'update') {
                        this._fixDrawTunnel(item);
                        this.$store.commit('updateTunnel', item);
                    }
                });
            },
            _handleUpdateBlastList(data){
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        let blast = this.$store.getters.getBlast(item.id);
                        if (blast === null || blast === undefined) {
                            this.workIdWithBlast[item.id] = {
                                0: [],  // Main Work
                                1: [],  // Supporting
                                2: []   // Idel Time
                            }
                            this._drawBlast(item, true);
                        }
                        this.$store.commit('addBlast', item);
                    } else if (data.kind === 'remove') {
                        let blast = this.$store.getters.getBlast(item),
                            tunnelId = blast.tunnel_id;
                        this.blastIdWithTunnel[tunnelId] = this._.without(this.blastIdWithTunnel[tunnelId], item);
                        var blastMarker = this.blastMarkers[item];
                        blastMarker.remove();
                        this.blastLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].removeGeometry(blastMarker)
                        this.$store.commit('removeBlast', item);
                    } else if (data.kind === 'update') {
                        this.$store.commit('updateBlast', item);
                        let workMarker = this.workLayer.getGeometryById(item.id);
                        if (!!workMarker) {
                            this.workLayer.removeGeometry([workMarker]);
                        }
                        this.drawWork(item);
                        this.clearForBlastData(item);
                        if (item.state == 2) {
                            let tunnelInfo = this.$store.getters.getTunnel(item.tunnel_id),
                                blastList = tunnelInfo.blast_list,
                                blastIndex = blastList.findIndex(x => x.id === item.id)
                            if (blastIndex == 0) {
                                this.handleAddBlast(item.tunnel_id, window.CONSTANTS.TUNNEL_TYPE.CAVERN)
                            }
                        }
                    }
                });
            },
            _handleUpdateBlastInfoList(data){
                const list = data.v;
                // TODO:
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        this.$store.commit('addBlast', item);
                    } else if (data.kind === 'remove') {
                        this.$store.commit('removeBlast', item);
                    } else if (data.kind === 'update') {
                        this.fixDrawblast(item);
                        this.$store.commit('updateBlast', item);
                    }
                });
            },
            _handleUpdateWorkList(data) {
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        this.$store.commit('addWork', item);
                        if (!(item.id in this.pauseIdWithWork)) {
                            this.pauseIdWithWork[item.id] = [];
                        }
                        let blast = this.$store.getters.getBlast(item.blast_id);
                        let _marker = this.workLayer.getGeometryById(blast.id);
                        if (_marker != null) {
                            this.workLayer.removeGeometry([_marker]);
                        }
                        let _blastMarker = this.blastLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].getGeometryById(blast.id);
                        if (_blastMarker != null) {
                            let typ = '';
                            if (item.category == window.CONSTANTS.CATEGORY.MAIN_WORK) {
                                typ = "main";
                            } else if (item.category == window.CONSTANTS.CATEGORY.SUPPORTING) {
                                typ = "supporting";
                            } else {
                                typ = "idle";
                            }
                            _blastMarker.updateSymbol({
                                lineColor: this.colorMap[typ]
                            });
                        }
                        if (this.workIdWithBlast[item.blast_id][item.category].length == 0) {
                            this.workIdWithBlast[item.blast_id][item.category].push(item.id);
                        } else {
                            this.workIdWithBlast[item.blast_id][item.category].unshift(item.id);
                        }
                        this.drawWork(blast);
                    } else if (data.kind === 'remove') {
                        let workData = this.$store.getters.getWork(item),
                            blast = this.$store.getters.getBlast(workData.blast_id),
                            _marker = this.workLayer.getGeometryById(blast.id),
                            _workIdWithBlast = this.workIdWithBlast[blast.id][workData.category];
                        this.$store.commit('removeWork', item)
                        if (item.id in this.pauseIdWithWork) {
                            delete this.pauseIdWithWork[item];
                        }
                        _workIdWithBlast.splice(0, 1)
                        if (_marker != null) {
                            this.workLayer.removeGeometry([_marker]);
                        }
                    } else if (data.kind === 'update') {
                        this.$store.commit('updateWork', item);
                    }
                });
            },
            _handleUpdateWorkHistoryList(data) {
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                    } else if (data.kind === 'remove') {
                    } else if (data.kind === 'update') {
                    }
                });
            },
            _handleUpdatePauseHistoryList(data) {
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        this.$store.commit('addPause', item);
                        if (item.work_id in this.pauseIdWithWork) {
                            this.pauseIdWithWork[item.work_id].push(item.id);
                        }
                    } else if (data.kind === 'remove') {
                        let pause = this.$store.getters.getPause(item);
                        this.pauseIdWithWork[pause.work_id] = this._.without(this.pauseIdWithWork[pause.work_id], item);
                        this.$store.commit('removePause', item);
                    } else if (data.kind === 'update') {
                    }
                });
            },
            _handleUpdateWorkEquipmentList(data) {
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        if (this.workEquipmentList.indexOf(item.id) < 0) {
                            this.workEquipmentList.push(item);
                        }
                    } else if (data.kind === 'remove') {
                        if (this.workEquipmentList.indexOf(item) >= 0) {
                            this.workEGquipmentList = this._.without(this.workEquipmentList, item);
                        }
                    } else if (data.kind === 'update') {
                    }
                });
            },
             _handleUpdateMessageList(data){
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        this.$store.commit('addMessage', item);
                    } else if (data.kind === 'remove') {
                        this.$store.commit('removeMessage', item);
                    } else if (data.kind === 'update') {
                        this.$store.commit('updateMessage', item);
                    }
                });
            },
            _handleUpdateTeamList(data){
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        this.$store.commit('addTeam', item);
                    } else if (data.kind === 'remove') {
                        this.$store.commit('removeTeam', item);
                    } else if (data.kind === 'update') {
                        this.$store.commit('updateTeam', item);
                    }
                });
            },
            _handleUpdateChargingList(data){
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        this.$store.commit('addCharging', item);
                    } else if (data.kind === 'remove') {
                        this.$store.commit('removeCharging', item);
                    } else if (data.kind === 'update') {
                        this.$store.commit('updateCharging', item);
                    }
                });
            },
            _handleUpdateBlastingList(data){
                const list = data.v;
                this._.forEach(list, item => {
                    if (data.kind === 'add') {
                        this.$store.commit('addBlasting', item);
                    } else if (data.kind === 'remove') {
                        this.$store.commit('removeBlasting', item);
                    } else if (data.kind === 'update') {
                        this.$store.commit('updateBlasting', item);
                    }
                });
            },
            _drawBasePoint(basePoint){
                const xPosition = basePoint.x_loc,
                      yPosition = basePoint.y_loc,
                      width = basePoint.width,
                      height = basePoint.height,
                      typ = window.CONSTANTS.TUNNEL_TYPE.BASEPOINT; // TODO:
                var marker = new maptalks.TextBox("", [xPosition, yPosition],
                                                  {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                                                  {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}, {
                    id: basePoint.id,
                    editable: true,
                    draggable: false,
                    boxSymbol: {
                        markerType: 'square',
                        markerLineColor: this.colorMap[typ],
                        markerLineWidth: 1,
                        markerFill: this.colorMap[typ],
                        markerFillOpacity: 1
                    },
                    symbol: {
                        textMaxWidth: {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                        textMaxHeight: {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}
                    }
                });
                marker.defaultWidth = width;
                marker.defaultHeight = height;
                marker.markerType = typ;
                this.basePointLayers[typ].addGeometry([marker]);
                this.basePointMarkers[typ][basePoint.id] = marker;
                this.$store.commit('addBasePoint', basePoint);
                // TODO:
                this._handleBasePointClickEvent(marker);
                // TODO: right click?
                marker.on('contextmenu', () => {});
            },
            _handleBasePointClickEvent(marker) {
                marker.on('click', (e) => {
                    this.handleClearSelectItem();
                    let _marker = this.basePointMarkers[e.target.markerType][e.target.getId()];
                    if (_marker != null) {
                        _marker.updateSymbol({
                                markerLineColor: '#000000',
                                markerLineWidth: 1,
                                markerFill: this.colorMap['selected'],
                                markerOpacity: 1
                        });
                        this.closeMenu();
                        this.setCurrentBaseId(_marker.getId());
                        this.setCurrentMarker(_marker);
                        this.setTunnelType(_marker.markerType);
                        this.setCurrentType(window.CONSTANTS.TYPE.SELECT_BASEPOINT);
                        e.domEvent.stopPropagation();
                    }
                });
            },
            _getActivityList() {
                this.services.getActivityList(activityList => {
                    this._.forEach(activityList, activity => {
                        window.CONSTANTS.WORK_NAME[parseInt(activity.activity_id)] = activity.name;
                        if (activity.category == 0) {
                            if (!!activity.file_path) {
                                window.CONSTANTS.URL.MAIN[parseInt(activity.activity_id)] = activity.file_path;
                            }
                        } else if (activity.category == 1) {
                            if (!!activity.file_path) {
                                window.CONSTANTS.URL.SUPPORTING[parseInt(activity.activity_id)] = activity.file_path;
                            }
                        } else if (activity.category == 2) {
                            if (!!activity.file_path) {
                                window.CONSTANTS.URL.IDLE[parseInt(activity.activity_id)] = activity.file_path;
                            }
                        }
                    });
                }, (error) => {
                    console.log("Failed to get activity list.", error);
                });
            },
            _getEquipmentList() {
                this.services.getEquipmentList(equipmentList => {
                    console.log("Success to get equipment list.", equipmentList);
                    this.$store.commit('addEquipmentList', equipmentList);
                }, (error) => {
                    console.log("Failed to get equipment list.", error);
                });
            },
            _getOperatorList() {
                this.services.getOperatorList(operatorList => {
                    console.log("Success to get operator list.", operatorList);
                    this.$store.commit('addOperatorList', operatorList);
                }, (error) => {
                    console.log("Failed to get operator list.", error);
                });
            },
            _getMessageList() {
                this.services.getMessageList(messageList => {
                    this.$store.commit('addMessageList', messageList);
                }, (error) => {
                    console.log("Failed to get message list.", error);
                });
            },
            _getTeamList() {
                this.services.getTeamList(teamList => {
                    this.$store.commit('addTeamList', teamList);
                }, (error) => {
                    console.log("Failed to get team list.", error);
                });
            },
            _getEquipmentInfoList() {
                this.services.getEquipmentInfoList(equipmentInfoList => {
                    // TODO:
                    console.log("Success to get equipment info list.", equipmentInfoList);
                }, (error) => {
                    console.log("Failed to get equipment info list.", error);
                });
            },
            _getChargingList() {
                this.services.getChargingList(chargingList => {
                    this.$store.commit('addChargingList', chargingList);
                }, (error) => {
                    console.log("Failed to get chargingList list.", error);
                });
            },
            _getBlastingList() {
                this.services.getBlastingList(blastingList => {
                    this.$store.commit('addBlastingList', blastingList);
                }, (error) => {
                    console.log("Failed to get blasting list.", error);
                });
            },
            _getBasePointList() {
                this.services.getBasePointList(basePointList => {
                    this._.forEach(basePointList, basePoint => {
                        this.tunnelIdWithBase[basePoint.id] = [];
                        this._drawBasePoint(basePoint);
                    });
                    this._getTunnelList();
                }, (error) => {
                    console.log("Failed to get basepoint list.", error);
                });
            },
            _getTunnelList() {
                this.services.getTunnelList(tunnels => {
                    this._.forEach(tunnels, tunnel => {
                        this.tunnelIDList.push(tunnel.id);
                        this.tunnelIdWithBase[tunnel.basepoint_id].push(tunnel.id);
                        this.blastIdWithTunnel[tunnel.id] = [];
                        this._drawTunnel(tunnel);
                        this._getBlastList(tunnel.blast_list);
                    });
                }, (error) => {
                    console.log("Failed to get tunnel list.", error);
                });
            },
            _getWorkList(workList, blast) {
                this._.forEach(workList, (work) => {
                    if (!(work.blast_id in this.workIdWithBlast)) {
                        this.workIdWithBlast[work.blast_id] = {
                            0: [],  // Main Work
                            1: [],  // Supporting
                            2: []   // Idel Time
                        }
                    }

                    if (work.category == window.CONSTANTS.CATEGORY.MAIN_WORK) {
                        this.workIdWithBlast[work.blast_id][0].push(work.id)
                    } else if (work.category == window.CONSTANTS.CATEGORY.SUPPORTING) {
                        this.workIdWithBlast[work.blast_id][1].push(work.id)
                    } else {
                        this.workIdWithBlast[work.blast_id][2].push(work.id)
                    }
                    let workMarker = this.workLayer.getGeometryById(blast.id);
                    if (!!workMarker) {
                        this.workLayer.removeGeometry([workMarker]);
                    }
                    this.$store.commit('addWork', work);
                    this.drawWork(blast);
                    this._getPauseList(work.pause_history_list);
                });
            },
            _getPauseList(pauseHistoryList) {
                this._.forEach(pauseHistoryList, (pause) => {
                    if (!(pause.work_id in this.pauseIdWithWork)) {
                        this.pauseIdWithWork[pause.work_id] = [];
                    }
                    this.pauseIdWithWork[pause.work_id].push(pause.id);
                    this.$store.commit('addPause', pause);
                });
            },
            _getBlastList(blastList) {
                this._.forEach(blastList, blast => {
                    if (!(blast.tunnel_id in this.blastIdWithTunnel)) {
                        this.blastIdWithTunnel[blast.tunnel_id] = [];
                    }
                    if (!(blast.id in this.workIdWithBlast)) {
                        this.workIdWithBlast[blast.id] = {
                            0: [],  // Main Work
                            1: [],  // Supporting
                            2: []   // Idel Time
                        }
                    }
                    this._drawBlast(blast, false);
                    this.$store.commit('addBlastInfo', blast.blast_info);
                    this.blastIDList.push(blast.id);
                    this._getWorkList(blast.work_list, blast);
                });
            },
            _getBlastInfoList() {
                this.services.getBlastInfoList(blastInfoList => {
                    this._.forEach(blastInfoList, blastInfo => {
                        this.$store.commit('addBlastInfo', blastInfo);
                    });
                }, (error) => {
                    console.log("Failed to get blast info list.");
                });
            },
            _fixDrawTunnel(tunnel){
                const oldTunnelData = this.$store.getters.getTunnel(tunnel.id)
                this.tunnelMarkers[oldTunnelData.category][tunnel.id].remove();
                this.arrowMarkers[tunnel.id].remove();
                var _marker = this.tunnelLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].getGeometryById(tunnel.id)
                this.tunnelLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].removeGeometry([_marker])
                this._drawTunnel(tunnel);
            },
            fixDrawblast(blast){
                var _marker = this.blastMarkers[blast.id];
                _marker.remove();
                this.blastLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].removeGeometry(_marker);
                this._drawBlast(blast, true);
            },
            _getCfactor(base, tunnel) {
                let ret = base,
                    factor = 4;
                if (tunnel.length >= 1200) {
                    ret += (factor * 12);
                } else if (tunnel.length >= 1100) {
                    ret += (factor * 11);
                } else if (tunnel.length >= 1000) {
                    ret += (factor * 10);
                } else if (tunnel.length >= 900) {
                    ret += (factor * 9);
                } else if (tunnel.length >= 800) {
                    ret += (factor * 8);
                } else if (tunnel.length >= 700) {
                    ret += (factor * 7);
                } else if (tunnel.length >= 600) {
                    ret += (factor * 6);
                } else if (tunnel.length >= 500) {
                    ret += (factor * 5);
                } else if (tunnel.length >= 400) {
                    ret += (factor * 4);
                } else if (tunnel.length >= 300) {
                    ret += (factor * 3);
                } else if (tunnel.length >= 200) {
                    ret += (factor * 2);
                } else if (tunnel.length >= 100) {
                    ret += (factor * 1);
                }
                return ret;
            },
            _drawTunnel(tunnel){
                const leftXLoc = tunnel.left_x_loc,
                      rightXLoc = tunnel.right_x_loc,
                      y_loc = tunnel.y_loc,
                      width = tunnel.width,
                      height = tunnel.height,
                      direction = tunnel.direction,
                      typ = tunnel.category; // TODO:
                let basePointInfo = this.$store.getters.getBasePoint(tunnel.basepoint_id),
                    textDx = {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                    arrowPl = "vertex-last",
                    markerSetting = [[leftXLoc, y_loc], [rightXLoc, y_loc]],
                    arrowSetting = [[leftXLoc, y_loc], [rightXLoc - 0.8, y_loc]],
                    arrowPosition = parseFloat(((tunnel.length / 2) * 0.0685).toFixed(1));

                if (tunnel.direction == window.CONSTANTS.DIRECTION.WEST ||
                    tunnel.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_WEST ||
                    tunnel.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_WEST) {
                    arrowPl = "vertex-first";
                    arrowSetting = [[leftXLoc + 0.8, y_loc], [rightXLoc, y_loc]];
                    textDx = {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]};
                }
                let marker = new maptalks.LineString(
                    markerSetting,
                    {
                        id: tunnel.id,
                        arrowStyle: null,
                        arrowPlacement: arrowPl,
                        symbol: {
                            'lineColor': this.colorMap[tunnel.category],
                            'lineWidth': {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]},
                            'lineOpacity': this.tunnelOpacity,
                            'textPlacement': 'line',
                            'textSize': {stops: [[4, 10], [5, 20], [6, 40], [7, 80]]},
                            'textDy': {stops: [[4, 2], [5, 4], [6, 8], [7, 16]]},
                            'textFill': '#ffffff',
                    }
                });
                marker.defaultWidth = width;
                marker.defaultHeight = height;
                marker.markerType = typ;
                this.tunnelLayers[typ].addGeometry([marker]);
                this.tunnelMarkers[typ][tunnel.id] = marker;
                this.$store.commit('addTunnel', tunnel);
                this._handleTunnelClickEvent(marker);
                // TODO: right click?
                marker.on('contextmenu', () => {});

                // TODO: arrowMarker id
                let _arrowMarker = new maptalks.LineString(
                    arrowSetting,
                    {
                        // arrowStyle: "classic",
                        arrowStyle: [0.5, 0.5],
                        arrowPlacement: arrowPl,
                        symbol: {
                            'lineColor': this.colorMap[tunnel.category],
                            'lineWidth': {stops: [[4, 5], [5, 10], [6, 20], [7, 40]]},
                            'lineOpacity': 1,
                            'textName': tunnel.tunnel_id,
                            'textPlacement': 'line',
                            'textSize': {stops: [[4, 10], [5, 20], [6, 40], [7, 80]]},
                            'textDy': {stops: [[4, 2], [5, 4], [6, 8], [7, 16]]},
                            'textFill': '#ffffff',
                            'textWeight': 'bold',
                            'textDx': textDx
                        }
                    }
                );
                this.tunnelLayers[typ].addGeometry([_arrowMarker]);
                this.arrowMarkers[tunnel.id] = _arrowMarker;
            },
            _handleTunnelClickEvent(marker) {
                marker.on('click', (e) => {
                    this.handleClearSelectItem();
                    let _marker = this.tunnelMarkers[e.target.markerType][e.target.getId()];
                    if (_marker != null) {
                        _marker.updateSymbol({
                            lineColor: this.colorMap['selected'],
                            lineOpacity: 1
                        });
                        this.closeMenu();
                        this.setCurrentTunnelId(_marker.getId());
                        this.setCurrentMarker(_marker);
                        this.setTunnelType(_marker.markerType);
                        this.setCurrentType(window.CONSTANTS.TYPE.SELECT_CAVERN);
                        e.domEvent.stopPropagation();
                    }
                });
            },
            clearForBlastData(blast) {
                let typ = window.CONSTANTS.TUNNEL_TYPE.BLAST;
                const tunnelData = this.$store.getters.getTunnel(blast.tunnel_id);
                if (blast.state === window.CONSTANTS.BLAST_STATE.FINISH) {
                    if (tunnelData.category == window.CONSTANTS.TUNNEL_CATEGORY.TH) {
                        typ = window.CONSTANTS.TUNNEL_TYPE.FINISH_TH;
                    } else if (tunnelData.category == window.CONSTANTS.TUNNEL_CATEGORY.B1) {
                        typ = window.CONSTANTS.TUNNEL_TYPE.FINISH_B1;
                    } else {
                        typ = window.CONSTANTS.TUNNEL_TYPE.FINISH_B2;
                    }
                } else {
                    if (blast.work_list.length > 0) {
                        if (blast.work_list[0].category == window.CONSTANTS.CATEGORY.MAIN_WORK) {
                            typ = "main";
                        } else if (blast.work_list[0].category == window.CONSTANTS.CATEGORY.SUPPORTING) {
                            typ = "supporting";
                        } else {
                            typ = "idle";
                        }
                    }
                }
                this.blastMarkers[blast.id].updateSymbol({
                    lineColor: this.colorMap[typ],
                    lineOpacity: 1
                });
                this.clearCurrentType();
                this.clearCurrentTunnelId();
                this.clearCurrentBaseId();
                this.clearTunnelType();
                this.clearCurrentBlastId();
                this.clearBlastType();
                this.clearCurrentWorkId();
                this.clearLastBlastId();
            },
            _drawBlast(blast, isUpdated) {
                const tunnelData = this.$store.getters.getTunnel(blast.tunnel_id),
                      leftXLoc = blast.left_x_loc,
                      rightXLoc = blast.right_x_loc,
                      blastWidth = blast.width,
                      blastHeight = blast.height;
                let typ = window.CONSTANTS.TUNNEL_TYPE.BLAST,
                    markerSetting = [[leftXLoc, blast.y_loc], [leftXLoc + blastWidth, blast.y_loc]],
                    arrowPl = "vertex-last";
                if (blast.state === window.CONSTANTS.BLAST_STATE.FINISH) {
                    if (tunnelData.category == window.CONSTANTS.TUNNEL_CATEGORY.TH) {
                        typ = window.CONSTANTS.TUNNEL_TYPE.FINISH_TH;
                    } else if (tunnelData.category == window.CONSTANTS.TUNNEL_CATEGORY.B1) {
                        typ = window.CONSTANTS.TUNNEL_TYPE.FINISH_B1;
                    } else {
                        typ = window.CONSTANTS.TUNNEL_TYPE.FINISH_B2;
                    }
                } else {
                    if (blast.work_list.length > 0) {
                        if (blast.work_list[0].category == window.CONSTANTS.CATEGORY.MAIN_WORK) {
                            typ = "main";
                        } else if (blast.work_list[0].category == window.CONSTANTS.CATEGORY.SUPPORTING) {
                            typ = "supporting";
                        } else {
                            typ = "idle";
                        }
                    } else if (blast.work_list.length == 0) {
                        if (tunnelData.category == window.CONSTANTS.TUNNEL_CATEGORY.TH) {
                            typ = window.CONSTANTS.TUNNEL_TYPE.FINISH_TH;
                        } else if (tunnelData.category == window.CONSTANTS.TUNNEL_CATEGORY.B1) {
                            typ = window.CONSTANTS.TUNNEL_TYPE.FINISH_B1;
                        } else {
                            typ = window.CONSTANTS.TUNNEL_TYPE.FINISH_B2;
                        }
                    }
                }
                if (tunnelData.direction == window.CONSTANTS.DIRECTION.WEST ||
                tunnelData.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_WEST ||
                tunnelData.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_WEST) {
                    arrowPl = "vertex-first";
                    markerSetting = [[rightXLoc - blastWidth, blast.y_loc], [rightXLoc, blast.y_loc]];
                }
                let _marker = new maptalks.LineString(
                markerSetting,
                {
                    id: blast.id,
                    arrowStyle: null,
                    arrowPlacement: arrowPl,
                    symbol: {
                        'lineColor': this.colorMap[typ],
                        'lineWidth': {stops: [[4, blastHeight], [5, blastHeight * 2], [6, blastHeight * 4], [7, blastHeight * 8]]},
                        'lineOpacity': 1,
                        'textPlacement': 'line',
                        'textSize': {stops: [[4, 10], [5, 20], [6, 40], [7, 80]]},
                        'textDy': {stops: [[4, 2], [5, 4], [6, 8], [7, 16]]},
                        'textFill': '#ffffff',
                    }
                });
                _marker.defaultWidth = blastWidth;
                _marker.defaultHeight = blastHeight;
                _marker.markerType = typ;
                this.blastMarkers[blast.id] = _marker;
                if (this.blastIdWithTunnel[tunnelData.id].indexOf(blast.id) < 0) {
                    if (isUpdated) {
                        this.blastIdWithTunnel[tunnelData.id].unshift(blast.id);
                    } else {
                        this.blastIdWithTunnel[tunnelData.id].push(blast.id);
                    }
                }
                this.$store.commit('addBlast', blast);
                this._handleBlastClickEvent(_marker)
                this.blastLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].addGeometry(_marker);
                let workMarker = this.workLayer.getGeometryById(blast.id);
                if (!!workMarker) {
                    this.workLayer.removeGeometry([workMarker]);
                }
                this.drawWork(blast);
            },
            getTunnelFromBasepoint() {
                if (!!!this.currentTunnelId) {
                    return [];
                } else {
                    let basepoint_id = this.$store.getters.getTunnel(this.currentTunnelId).basepoint_id;
                    return this.tunnelIdWithBase[basepoint_id];
                }
            },
            _handleBlastClickEvent(marker) {
                marker.on('click', (e) => {
                    this.handleClearSelectItem();
                    let _marker = this.blastMarkers[marker.getId()];
                    if (_marker != null) {
                        _marker.updateSymbol({
                            lineColor: this.colorMap['selected'],
                            lineOpacity: 1
                        });
                        this.closeMenu();
                        this.setCurrentBlastId(_marker.getId());
                        this.setCurrentMarker(_marker);
                        this.setBlastType(_marker.type);
                        this.setCurrentType(window.CONSTANTS.TYPE.SELECT_BLAST);
                        e.domEvent.stopPropagation();
                    }
                });
            },
            drawWork(blast) {
                // TODO:
                if (blast.state === window.CONSTANTS.BLAST_STATE.IN_PROGRESS) {
                    let currentCategory = null,
                        currentTyp = null,
                        currentWorkId = null;

                    if (blast.work_list.length !== 0) {
                        currentCategory = blast.work_list[0].category;
                        currentTyp = blast.work_list[0].typ;
                        currentWorkId = blast.work_list[0].id;
                    }
                    let fileUrl = '';
                    if (currentCategory != null && currentTyp != null) {
                        if (currentCategory == window.CONSTANTS.CATEGORY.MAIN_WORK) {
                            if (currentTyp in window.CONSTANTS.URL.MAIN) {
                                fileUrl =`${ window.CONSTANTS.URL.BASE_IMG }${ window.CONSTANTS.URL.MAIN[currentTyp] }`;
                            } else {
                                fileUrl =`${ window.CONSTANTS.URL.BASE_IMG }${ window.CONSTANTS.URL.DEFUALT_IMG.MAIN }`;
                            }
                        } else if (currentCategory == window.CONSTANTS.CATEGORY.SUPPORTING) {
                            if (currentTyp in window.CONSTANTS.URL.SUPPORTING) {
                                fileUrl =`${ window.CONSTANTS.URL.BASE_IMG }${ window.CONSTANTS.URL.SUPPORTING[currentTyp] }`;
                            } else {
                                fileUrl =`${ window.CONSTANTS.URL.BASE_IMG }${ window.CONSTANTS.URL.DEFUALT_IMG.SUPPORTING }`;
                            }
                        } else {
                            if (currentTyp in window.CONSTANTS.URL.IDLE) {
                                fileUrl =`${ window.CONSTANTS.URL.BASE_IMG }${ window.CONSTANTS.URL.IDLE[currentTyp] }`;
                            } else {
                                fileUrl =`${ window.CONSTANTS.URL.BASE_IMG }${ window.CONSTANTS.URL.DEFUALT_IMG.IDLE }`;
                            }
                        }
                    }
                    if (fileUrl !== '') {
                        let marker = new maptalks.Marker(
                            [(blast.left_x_loc + blast.right_x_loc)/2 , blast.y_loc + 0.05], {
                                id: blast.id,  // TODO:
                                symbol: {
                                    'markerFile': fileUrl,
                                    'markerWidth': {stops: [[4, 20], [5, 30], [6, 50], [7, 80]]},
                                    'markerHeight': {stops: [[4, 20], [5, 30], [6, 50], [7, 80]]}
                                }
                            }
                        )
                        this.workLayer.addGeometry(marker);
                        marker.on('click', (e) => {
                            this.handleClearSelectItem();
                            let _blastMarker = this.blastMarkers[blast.id];
                            if (_blastMarker != null) {
                                _blastMarker.updateSymbol({
                                        markerLineColor: '#000000',
                                        markerLineWidth: 1,
                                        markerFill: this.colorMap['selected'],
                                        markerOpacity: 1
                                });
                                this.closeMenu();
                                this.setCurrentBlastId(_blastMarker.getId());
                                this.setCurrentMarker(_blastMarker);
                                this.setBlastType(_blastMarker.type);
                                if (currentWorkId != null) {
                                    // View the Current Work information

                                    this.services.getWorkDataByWork({"work_id": currentWorkId}, (resData) => {
                                        console.log("Success to get work Data list");
                                        this.workEquipmentList = [];

                                        this._.forEach(resData.equipment, workEquipment => {
                                            this.workEquipmentList.push(workEquipment);
                                        });
                                        this.setCurrentWorkId(currentWorkId);
                                        this.setCurrentType(window.CONSTANTS.TYPE.SELECT_WORK);
                                    }, (error) => {
                                        console.log("Failed to work data list.")
                                    });
                                } else {
                                    // View the Blast information
                                    this.setCurrentType(window.CONSTANTS.TYPE.SELECT_BLAST_INFORMATION);
                                }
                                e.domEvent.stopPropagation();
                            }
                        });
                    }
                }
            },
            handleClearSelectItem() {
                if (this.currentMarker !== null) {
                    if (this.currentMarker.markerType == window.CONSTANTS.TUNNEL_CATEGORY.TH
                        || this.currentMarker.markerType == window.CONSTANTS.TUNNEL_CATEGORY.B1
                        || this.currentMarker.markerType == window.CONSTANTS.TUNNEL_CATEGORY.B2) {
                        this.currentMarker.updateSymbol({
                            lineColor: this.colorMap[this.currentMarker.markerType],
                            lineOpacity: this.tunnelOpacity
                        });
                    } else if (this.currentMarker.markerType == window.CONSTANTS.TUNNEL_TYPE.BASEPOINT) {
                        this.currentMarker.updateSymbol({
                            markerLineColor: this.colorMap[window.CONSTANTS.TUNNEL_TYPE.BASEPOINT],
                            markerLineWidth: 1,
                            markerFill: this.colorMap[window.CONSTANTS.TUNNEL_TYPE.BASEPOINT],
                            markerFillOpacity: 1
                        });
                    } else {
                        this.currentMarker.updateSymbol({
                            lineColor: this.colorMap[this.currentMarker.markerType],
                            lineOpacity: 1
                        });
                    }
                    this.clearAll();
                }
            },
            handleWorkInfoCloseButton() {
                this.handleClearSelectItem();
            },
            handleBasePointInfoCloseButton() {
                this.handleClearSelectItem();
            },
            handleBlastInfoInformationButton(blastId) {
                this.setCurrentType(window.CONSTANTS.TYPE.SELECT_BLAST_INFORMATION);
                //this.handleClearSelectItem();
            },
            handleBlastInfoCloseButton() {
                this.handleClearSelectItem();
            },
            handleSelectWorkItem(workId) {
                this.services.getWorkDataByWork({"work_id": workId}, (resData) => {
                    console.log("Success to get work Data list", resData);
                    this.workEquipmentList = [];

                    this._.forEach(resData.equipment, workEquipment => {
                        this.workEquipmentList.push(workEquipment);
                    });
                    this.setCurrentWorkId(workId);
                    this.setCurrentType(window.CONSTANTS.TYPE.SELECT_WORK);
                }, (error) => {
                    console.log("Failed to work data list.")
                });
            },
            handleBlastInfoOkButton(data) {
                this.handleClearSelectItem();
                this.services.updateBlastInfo(data, (resData) => {
                    console.log("success to update blast info")
                }, (error) => {
                    console.log("fail to update blast info: ", error)
                });
            },
            handleTunnelInfoCloseButton() {
                this.handleClearSelectItem();
            },
            closeMenu() {
                if (this.contextMenuItem !== null) {
                    this.contextMenuItem.closeMenu();
                    this.contextMenuItem = null;
                }
                this.map.closeMenu();
            },
            setBlastContextMenu(marker, tunnel_id) {
                marker.setMenu({
                    items: `<div class="context-menu-container scanner">
                                <div class="context-menu-top-panel">
                                    <div class="context-menu-text-wrapper">
                                        <div class="context-menu-name-text">${ tunnel_id }</div>
                                    </div>
                                </div>
                                <div class="context-menu-bottom-panel">
                                    <div id="detail-button" class="context-menu-button-frame scanner">
                                        <div class="context-menu-button-panel">
                                            <div id="detail-button-text" class="context-menu-button-text">DETAIL ON</div>
                                        </div>
                                    </div>
                                </div>
                            </div>`,
                    width: 350,
                    custom: true,
                    dy: -150,
                    dx: -90,
                    animation: 'fade'
                }).openMenu();
                document.getElementById('detail-button').onclick = () => {
                    console.log("### click")
                    marker.closeMenu();
                }
            },
            clearAll() {
                this.clearCurrentType();
                this.clearCurrentMarker();
                this.clearCurrentTunnelId();
                this.clearTunnelType();
                this.clearCurrentBlastId();
                this.clearBlastType();
                this.clearCurrentWorkId();
            },
            clearCurrentType() {
                this.currentType = null;
            },
            clearCurrentMarker() {
                this.currentMarker = null;
            },
            setCurrentBaseId(id) {
                this.currentBaseId = id;
            },
            clearCurrentBaseId() {
                this.currentBaseId = null;
            },
            clearCurrentTunnelId() {
                this.currentTunnelId = null;
            },
            clearTunnelType() {
                this.currentTunnelType = null;
            },
            clearCurrentBlastId() {
                this.currentBlastId = null;
            },
            clearBlastType() {
                this.currentBlastType = null;
            },
            clearCurrentWorkId() {
                this.currentWorkId = null;
            },
            clearLastBlastId() {
                this.lastBlastId = '';
            },
            setCurrentTunnelId(id) {
                this.currentTunnelId = id;
            },
            setTunnelType(typ) {
                this.currentTunnelType = typ;
            },
            setCurrentBlastId(id) {
                this.currentBlastId = id;
            },
            setCurrentMarker(marker) {
                this.currentMarker = marker;
            },
            setBlastType(typ) {
                this.currentBlastType = typ;
            },
            setCurrentType(typ) {
                this.currentType = typ;
            },
            setCurrentWorkId(workId) {
                this.currentWorkId = workId;
            },
            getCurrentType() {
                return this.currentType;
            },
            getSupportingList() {
                let supportingList = [];
                if (this.currentBlastId !== null) {
                    supportingList = this.workIdWithBlast[this.currentBlastId][1];
                    if (supportingList == undefined) {
                        supportingList = [];
                    }
                }
                return supportingList;
            },
            getIdleList() {
                let idleList = [];
                if (this.currentBlastId !== null) {
                    idleList = this.workIdWithBlast[this.currentBlastId][2];
                    if (idleList == undefined) {
                        idleList = [];
                    }
                }
                return idleList;
            },
            getPauseList() {
                let pauseList = [];
                if (this.currentworkId !== null) {
                    pauseList = this.pauseIdWithWork[this.currentWorkId];
                }
                return pauseList;

            },
            getOperatorList() {
                let operatorList = this.$store.getters.getOperatorList();
                return operatorList;
            },
            getEquipmentList() {
                let equipmentList = this.$store.getters.getEquipmentList();
                return equipmentList;
            },
            getWorkList() {
                let workList = [];
                if (this.currentBlastId !== null) {
                    workList = this.workIdWithBlast[this.currentBlastId][0];
                    if (workList == undefined) {
                        workList = [];
                    }
                }
                return workList;
            },
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
                if (this.showBeaconList) {
                    this.showBeaconList = false;
                    this.showBeaconData = {};
                } else {
                    this.services.getGadgetCountList((data) => {
                        this.showBeaconData = data;
                        this.showBeaconList = true;
                    })
                }
            });

            window.addEventListener("beforeunload", () => {
                this.$refs.infowindow.handleSelectCloseButton();
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

    .infoFilterRouter {
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

    .filterRouterIcon {
        width: 60px;
        height: 60px;
        cursor: pointer;
        border-color: #fff;
        margin-left: 18px;
        margin-bottom: 20px;
        margin-top: 15px;
        background-repeat: no-repeat;
        background-image: url('../../public/static/location/imgs/router.svg');
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

    .routerFilter {
        background-size: 60px;
        background-image: url('../../public/static/location/imgs/router-offline.png');
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
        margin-left: 2.5em;
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
    .filter-Selectall-Button {
        display: inline-block;
        margin-left: 2.5em;
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
        margin: 1em 3em 0 3em;
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

    .beacon-filter-Selectall-Button {
        display: inline-block;
        margin: 1em 3em 0 3em;
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

    .routerInfo {
        width: 100%;
        height: 200px;
        list-style: none;
        padding: 0;
        text-align: center;
        margin-block-start: 0px !important;
        margin-block-end: 0 !important;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 11px 11px 20px #aaaaaa99;
    }

    .routerContainer {
        height: 200px;
        width: 200px;
        background-color: rgb(22, 220, 120);
        border-radius: 10px;
        letter-spacing: 1px;
        padding-top: 20px;
    }

    .routerSubContainer {
        width: 100%;
        height: 70px;
        margin: -2px 0px 0px 15px;
        color: white;
        overflow: hidden;
        text-align: left;
        font-weight: 900;
        letter-spacing: 1px;
    }

    .routerSubTitle {
        font-weight: 350;
        font-size: 13px;
        padding-bottom: 5px;
        padding-top: 5px;
    }
    .routerSubValue {
        width: 100%;
        height: 40px;
        color: white;
        text-align: left;
        overflow: hidden;
        font-weight: 900;
        font-size: large;
    }
    .router-status.lock-img {
        background-image: url(../../public/static/location/imgs/lock.svg);
        background-size: 20px;
        background-repeat: no-repeat;
        background-position: center;
        width: 20px;
        height: 20px;
        margin-left: 10%;
    }
    .router-status.unlock-img {
        background-image: url(../../public/static/location/imgs/unlock.svg);
        background-size: 20px;
        background-repeat: no-repeat;
        background-position: center;
        width: 20px;
        height: 20px;
        margin-left: 10%;
    }

    .router-close-button-custom {
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
        left: 77%;
        top: -30px;
        cursor: pointer;
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

    .context-menu-container.router {
        background-color: rgb(22, 220, 120);
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
        border-top: thin solid rgb(22, 160, 134);
    }

    .context-menu-button-frame.speaker {
        background-color: rgb(255, 140, 144);
        border-top: thin solid rgb(250, 115, 120)
    }

    .context-menu-button-frame.router {
        background-color: rgb(115, 232, 115);
        border-top: thin solid rgb(16, 210, 111);
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

    .context-menu-top-panel {
        position: relative;
        width: 100%;
        height: 40px;
    }

    .context-menu-text-wrapper {
        position: absolute;
        width: 100%;
        bottom: 5px;
        text-align: center;
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

    .context-menu-button-panel {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
    }

    .context-menu-button-text {
        text-align: center;
        font-size: 0.8em;
    }

</style>
