<template>
    <div id="main" class="main-container">
        <Top :selectedType="isTopPressedType" @select-top-button="handleTopButton"></Top>
        <AddBasePoint :type="getCurrentType()"
            @select-ok-button="handleAddBasePointOkButton"
            @select-cancel-button="handleAddBasePointCancelButton"></AddBasePoint>
        <BasePointInfo :type="getCurrentType()" :id="currentTunnelId"
            @select-ok-button="handleBasePointInfoOkButton"
            @select-close-button="handleBasePointInfoCloseButton"
            @select-add-cavern-button="handleAddCavern"
            @select-remove-basepoint-button="handleRemoveBasePoint"></BasePointInfo>
        <AddTunnel :type="getCurrentType()"
            @change-tunnel-direction="handleChangeDirectionCavern"
            @change-tunnel-length="handleChangeLengthCavern"
            @select-ok-button="handleAddTunnelOkButton"
            @select-cancel-button="handleAddTunnelCancelButton"></AddTunnel>
        <TunnelInfo :type="getCurrentType()" :id="currentTunnelId"
            @change-tunnel-direction="handleChangeDirectionCavern"
            @change-tunnel-length="handleChangeLengthCavern"
            @select-add-cavern-button="editCavern"
            @select-edit-cancel-button="handleEditExDataClear"
            @select-ok-button="handleTunnelInfoOkButton"
            @select-close-button="handleTunnelInfoCloseButton"
            @select-add-blast-button="handleAddBlast"
            @select-remove-tunnel-button="handleRemoveTunnel"></TunnelInfo>
        <AddBlast :type="getCurrentType()" :tunnelId="currentTunnelId"
            :lastBlastId="lastBlastId"
            @change-blasting-length="_handleChangeLengthBlast"
            @select-ok-button="handleAddBlastOkButton"
            @select-cancel-button="handleAddBlastCancelButton"></AddBlast>
        <BlastInfo :type="getCurrentType()" :id="currentBlastId"
            :workIdList="getWorkList()"
            :supportingIdList="getSupportingList()"
            :idleIdList="getIdleList()"
            @select-close-button="handleBlastInfoCloseButton"
            @select-edit-close-button="handleBlastEditClose"
            @select-ok-button="handleBlastInfoOkButton"
            @select-add-work-button="handleAddWork"
            @select-remove-blast-button="handleRemoveBlast"
            @select-edit-blast-button="handleEditBlast"
            @change-blast-length="handleEditChangeLengthBlast"
            @select-edit-blast-cancel-button="handleEditBlastCancel"
            @select-work-item="handleSelectWorkItem"></BlastInfo>
        <BlastInformation :type="getCurrentType()" :id="currentBlastId"
            @select-ok-button="handleBlastInfoOkButton"
            @select-close-button="handleBlastInfoCloseButton"></BlastInformation>
        <AddWork :type="getCurrentType()" :blastId="currentBlastId"
            @select-cancel-button="clearForBlastData"
            @select-ok-button="handleWorkAddOkButton"></AddWork>
        <WorkInfo ref="workInfoView" :type="getCurrentType()" :blastId="currentBlastId"
            :id="currentWorkId" :pauseList="getPauseList()"
            :operatorList="getOperatorList()" :equipmentList="getEquipmentList()"
            :workEquipmentList="workEquipmentList"
            @select-cancel-button="handleWorkInfoCancelButton"
            @select-ok-button="handleWorkInfoOkButton"
            @select-close-button="handleWorkInfoCloseButton"
            @select-remove-work-button="handleWorkRemoveButton"></WorkInfo>
        <Legend :isShow="isShowLegend"></Legend>
        <div :id="id" class="map-container">
        </div>
    </div>
</template>
<script>
import * as maptalks from 'maptalks';
import Top from '@/components/Top';
import AddBasePoint from '@/components/AddBasePoint';
import AddTunnel from '@/components/AddTunnel';
import AddBlast from '@/components/AddBlast';
import AddWork from '@/components/AddWork';
import BasePointInfo from '@/components/BasePointInfo';
import TunnelInfo from '@/components/TunnelInfo';
import BlastInfo from '@/components/BlastInfo';
import BlastInformation from '@/components/BlastInformation';
import WorkInfo from '@/components/WorkInfo';
import Legend from '@/components/Legend';
export default {
    name: 'Main',
    components: {
        Top,
        AddBasePoint,
        AddTunnel,
        AddBlast,
        AddWork,
        BasePointInfo,
        TunnelInfo,
        BlastInfo,
        BlastInformation,
        WorkInfo,
        Legend
    },
    data() {
        return {
            id: 'map',
            info: {},
            map: null,
            basePointLayers: {},  // {t_type: layer}
            tunnelLayers: {},  // {t_type: layer}
            blastLayers: {},  // {t_type : layer}
            extraLayers: {},
            workLayers: {},
            zoomLevel: 0,
            basePointMarkers: {},  // {t_type: {bp_id: bp_marker}}
            tunnelMarkers: {},    // {t_type: {t_id: t_marker}}
            arrowMarkers: {},
            blastMarkers: {},  // {b_id: b_marker, ..}
            blastIdWithTunnel: {},    // {t_id: [b_id, ..]}
            workIdWithBlast: {},    // {b_id: {0: [w_id, ..], 1: [w_id, ..], 2: [w_id, ..]}} 0(MainWork), 1(Supporting), 2(IdelTime)
            pauseIdWithWork: {},  // {w_id: [p_id, ..]}
            markers: {},
            hidingMarker: null,
            infoWindowItem: null,
            contextMenuItem: null,
            markerPosition: null,
            checkInterval: null,
            isWebsoketConnected: false,
            filterList: [],
            isForGroup: false,
            isTopPressedType: '',
            tunnelIDList: [],
            blastIDList: [],
            progIDList: [],
            workIDList: [],
            workEquipmentList: [],
            //
            currentType: null,
            currentTunnelId: null,
            currentTunnelType: null,
            currentBlastId: null,
            currentWorkId: null,
            currentBlastType: null,
            currentMarker: null,
            lastBlastId: '',
            //
            blastLayer: null,
            workLayer: null,
            colorMap: {
                'selected': '#dddddd',
                '0': '#a0a0ff',
                '1': '#00aabb',
                '3': '#5e5e5e',
                '4': '#0000ff',
                '100': '#01b050',
                '101': '#9f5900',
                '102': '#7031a0',
                '1000': '#01b050',
                '1001': '#9f5900',
                '1002': '#7031a0',
                // OLD
                // '100': '#00aabb',
                // '101': '#0070c0',
                // '102': '#92d050',
                // '1000': '#00b050',
                // '1001': '#ffcd8c',
                // '1002': '#a05900',
                'main' : '#ff0a01',
                'supporting' : '#0f02ff',
                'idle' : '#feff00'
            },
            tunnelOpacity: 0.6,
            isShowLegend: false
        }
    },
    methods: {
        _initLoadMap() {
            this.services.getMapFile(url => {
                this.map = new maptalks.Map(this.id, {
                    // centerCross: true,
                    center: [90, 50],
                    zoom: 4,
                    maxZoom: 6,
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
                    touchGesture: false,
                    touchZoom: false,
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
                this.map.fitExtent();
                this.initContextMenu();
                this._registerMapHandler();
            });
        },
        _registerMapHandler() {
            if (!!this.map) {
                this.map.once('baselayerload', () => {
                    this.zoomLevel = 50 * (this.map.getZoom() / 11);
                    // Tunnel Type
                    this._.forEach(window.CONSTANTS.TUNNEL_TYPE, (value, key) => {
                        this.tunnelLayers[value] = new maptalks.VectorLayer(value).addTo(this.map);
                        this.tunnelLayers[value].setZIndex(1);
                        this.tunnelMarkers[value] = {};
                        this.blastLayers[value] = new maptalks.VectorLayer('p' + value).addTo(this.map);
                        this.blastLayers[value].setZIndex(2);

                        this.basePointLayers[value] = new maptalks.VectorLayer('b' + value).addTo(this.map);
                        this.basePointLayers[value].setZIndex(0);
                        this.basePointMarkers[value] = {};
                    });
                    this._getEquipmentList();
                    this._getOperatorList();
                    //TODO:
                    this._getMessageList();
                    this._getTeamList();
                    this._getEquipmentInfoList();
                    this._getBasePointList();
                    this.blastLayer = new maptalks.VectorLayer('vector').addTo(this.map);
                    this.blastLayer.setZIndex(2);
                    this.workLayer = new maptalks.VectorLayer('vector1').addTo(this.map);
                    this.workLayer.setZIndex(101);
                    this.extraLayers = new maptalks.VectorLayer('vector150').addTo(this.map);
                    this.extraLayers.setZIndex(150);

                });
                this.map.on('zoomend moveend', (e) => {
                    this.zoomLevel = 50 * (this.map.getZoom() / 11);
                    this._setContextMenuPosition();
                });
                this.map.on('click', (e) => {
                    // TODO:
                    // console.log("##### x : " +  e.coordinate.x + " Y : " + e.coordinate.y);
                    this.closeInfoWindow();
                    this.closeMenu();
                    this.isTopPressedType = '';
                });
            }
        },
        _getUUID() {
          return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 3 | 8);
            return v.toString(16);
          });
        },
        _getEquipmentList() {
            this.services.getEquipmentList(equipmentList => {
                // TODO:
                // console.log("Success to get equipment list.", equipmentList);
                this.$store.commit('addEquipmentList', equipmentList);
            }, (error) => {
                console.log("Failed to get equipment list.", error);
            });
        },
        _getOperatorList() {
            this.services.getOperatorList(operatorList => {
                // TODO:
                // console.log("Success to get operator list.", operatorList);
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
                // console.log("Success to get equipment info list.", equipmentInfoList);
            }, (error) => {
                console.log("Failed to get equipment info list.", error);
            });
        },
        _getBasePointList() {
            this.services.getBasePointList(basePointList => {
                // TODO:
                // console.log("Success to get basepoint list.");
                this._.forEach(basePointList, basePoint => {
                    this._drawBasePoint(basePoint);
                });
                this._getTunnelList();
            }, (error) => {
                console.log("Failed to get basepoint list.", error);
            });
        },
        _getTunnelList() {
            this.services.getTunnelList(tunnels => {
                // TODO:
                // console.log("Success to get tunnels");
                this._.forEach(tunnels, tunnel => {
                    this.tunnelIDList.push(tunnel.id);
                    this.blastIdWithTunnel[tunnel.id] = [];
                    this._drawTunnel(tunnel);
                    this._getBlastList(tunnel.blast_list);
                });
                this._getWorkList();
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
        _drawTunnel(tunnel){
            const xPosition = tunnel.x_loc,
                  yPosition = tunnel.y_loc,
                  width = tunnel.width,
                  height = tunnel.height,
                  typ = tunnel.category; // TODO:
            let marker = new maptalks.TextBox("", [xPosition, yPosition],
                                              {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                                              {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}, {
                id: tunnel.id,
                editable: false,
                draggable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: this.colorMap[typ],
                    markerLineWidth: 1,
                    markerFill: this.colorMap[typ],
                    markerFillOpacity: this.tunnelOpacity
                },
                symbol: {
                    textMaxWidth: {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                    textMaxHeight: {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}
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
            let cFactor = 30;   // 100 : 34  , 200 : 38  , 300 : 42
            let arrowPosition = parseFloat(((tunnel.length / 2) * 0.0685).toFixed(1)),
                arrowPl = "vertex-last",
                textDxBase = parseInt(tunnel.width / 2) - cFactor,
                textDx = {stops: [[4, textDxBase], [5, textDxBase * 2], [6, textDxBase * 4], [7, textDxBase * 8]]};
            if (tunnel.direction == window.CONSTANTS.DIRECTION.WEST ||
                tunnel.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_WEST ||
                tunnel.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_WEST) {
                arrowPl = "vertex-first";
                textDxBase = -parseInt((tunnel.width / 2) - cFactor),
                textDx = {stops: [[4, textDxBase], [5, textDxBase * 2], [6, textDxBase * 4], [7, textDxBase * 8]]};
            }
            // TODO: arrowMarker id
            let arrowSetting = null,
                basePointInfo = this.$store.getters.getBasePoint(tunnel.basepoint_id);
            if (textDxBase > 0) {
                arrowSetting = [[basePointInfo.x_loc, yPosition], [basePointInfo.x_loc + (arrowPosition * 2) - 1, yPosition]];
            } else {
                arrowSetting = [[basePointInfo.x_loc - (arrowPosition * 2) + 1, yPosition], [basePointInfo.x_loc, yPosition]];
            }
            let _arrowMarker = new maptalks.LineString(
                arrowSetting,
                {
                    // arrowStyle: "classic",
                    arrowStyle: [0.5, 0.5],
                    arrowPlacement: arrowPl,
                    symbol: {
                        'lineColor': this.colorMap[typ],
                        'lineWidth': {stops: [[4, 8], [5, 16], [6, 32], [7, 64]]},
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
        setCurrentType(typ) {
            this.currentType = typ;
        },
        getCurrentType() {
            return this.currentType;
        },
        clearCurrentType() {
            this.currentType = null;
        },
        isBlastInfoType() {
            return this.addType == null && this.currentBlastType != null;
        },
        setAddType(typ) {
            this.addType = typ;
        },
        clearAddType() {
            this.addType = null;
        },
        setCurrentMarker(marker) {
            this.currentMarker = marker;
        },
        clearCurrentMarker() {
            this.currentMarker = null;
        },
        setCurrentTunnelId(id) {
            this.currentTunnelId = id;
        },
        clearCurrentTunnelId() {
            this.currentTunnelId = null;
        },
        setTunnelType(typ) {
            this.currentTunnelType = typ;
        },
        clearTunnelType() {
            this.currentTunnelType = null;
        },
        setCurrentBlastId(id) {
            this.currentBlastId = id;
        },
        setBlastType(typ) {
            this.currentBlastType = typ;
        },
        clearCurrentBlastId() {
            this.currentBlastId = null;
        },
        clearBlastType() {
            this.currentBlastType = null;
        },
        setCurrentWorkId(workId) {
            this.currentWorkId = workId;
        },
        clearCurrentWorkId() {
            this.currentWorkId = null;
        },
        setLastBlastId(blastId) {
            this.lastBlastId = blastId;
        },
        clearLastBlastId() {
            this.lastBlastId = '';
        },
        clearAll() {
            let currentMarkId = this.currentMarker.getId();
            if (currentMarkId in this.blastMarkers) {
                let typ = window.CONSTANTS.TUNNEL_TYPE.BLAST,
                    blast = this.$store.getters.getBlast(currentMarkId);
                if (!!blast) {
                    let tunnelData = this.$store.getters.getTunnel(blast.tunnel_id);
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
                            markerLineColor: this.colorMap[typ],
                            // TODO:
                            markerLineWidth: 1,
                            markerFill: this.colorMap[typ],
                            markerOpacity: 1
                    });
                }
            } else {
                this.clearCurrentMarker();
            }
            this.clearCurrentType();
            this.clearCurrentTunnelId();
            this.clearTunnelType();
            this.clearCurrentBlastId();
            this.clearBlastType();
            this.clearCurrentWorkId();
            this.clearLastBlastId();
        },
        initContextMenu() {
            this.contextMenuOption = {
                'custom': true,
                'items': `<div class="custom_menu">
                <div class="additem">
                    <div id="cavernItem">ADD BASEPOINT</div>
                </div>
                          </div>`,
                dx: -75,
                animation: 'fade'
            };
            this.map.on('contextmenu', (e) => {
                this.contextCoordinate = e.coordinate;
                this.closeInfoWindow();
                this.closeMenu();
                this.map.closeMenu();
                this.map.setMenu(this.contextMenuOption).openMenu(e.coordinate);

                document.getElementById('cavernItem').onclick = () => {
                    this.map.closeMenu();
                    this.handleAddBasePoint(e.coordinate.x, e.coordinate.y);
                }
            });
        },
        handleClearSelectItem() {
            if (this.currentMarker !== null) {
                if (this.currentMarker.markerType == window.CONSTANTS.TUNNEL_CATEGORY.TH
                    || this.currentMarker.markerType == window.CONSTANTS.TUNNEL_CATEGORY.B1
                    || this.currentMarker.markerType == window.CONSTANTS.TUNNEL_CATEGORY.B2) {
                    this.currentMarker.updateSymbol({
                            markerLineColor: this.colorMap[this.currentMarker.markerType],
                            markerLineWidth: 1,
                            markerFill: this.colorMap[this.currentMarker.markerType],
                            markerFillOpacity: this.tunnelOpacity
                    });
                } else {
                    this.currentMarker.updateSymbol({
                            markerLineColor: this.colorMap[this.currentMarker.markerType],
                            markerLineWidth: 1,
                            markerFill: this.colorMap[this.currentMarker.markerType],
                            markerFillOpacity: 1
                    });
                }
                this.clearAll();
            }
        },
        handleClearSelectItemWithoutClear() {
            if (this.currentMarker !== null) {
                if (this.currentMarker.markerType == window.CONSTANTS.TUNNEL_CATEGORY.TH
                    || this.currentMarker.markerType == window.CONSTANTS.TUNNEL_CATEGORY.B1
                    || this.currentMarker.markerType == window.CONSTANTS.TUNNEL_CATEGORY.B2) {
                    this.currentMarker.updateSymbol({
                        markerLineColor: this.colorMap[this.currentMarker.markerType],
                        markerLineWidth: 1,
                        markerFill: this.colorMap[this.currentMarker.markerType],
                        markerFillOpacity: this.tunnelOpacity
                    });
                } else {
                    this.currentMarker.updateSymbol({
                        markerLineColor: this.colorMap[this.currentMarker.markerType],
                        markerLineWidth: 1,
                        markerFill: this.colorMap[this.currentMarker.markerType],
                        markerFillOpacity: 1
                    });
                }
            }
        },
        // ***************** //
        // Handle Base Point //
        // ***************** //
        handleAddBasePoint(xPosition, yPosition) {
            this.setCurrentType(window.CONSTANTS.TYPE.ADD_BASEPOINT);
            this.setTunnelType(window.CONSTANTS.TUNNEL_TYPE.BASEPOINT);
            var width = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.BASEPOINT.WIDTH,
                height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.BASEPOINT.HEIGHT,
                marker = new maptalks.TextBox("", [xPosition, yPosition],
                                              {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                                              {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}, {
                id: this._getUUID(),
                editable: false,
                draggable: true,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.colorMap[window.CONSTANTS.TUNNEL_TYPE.BASEPOINT],
                    markerFillOpacity: 0.3
                },
                symbol: {
                    textMaxWidth: {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                    textMaxHeight: {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}
                }
            });
            marker.defaultWidth = width;
            marker.defaultHeight = height;
            marker.markerType = window.CONSTANTS.TUNNEL_TYPE.BASEPOINT;
            this.basePointLayers[window.CONSTANTS.TUNNEL_TYPE.BASEPOINT].addGeometry([marker]);
            marker.on('dragend', (e) => {
                e.domEvent.stopPropagation();
                this.closeMenu();
            })
            this.setCurrentMarker(marker);
        },
        handleAddBasePointOkButton(value) {
            const data = {}
            data.id = this.currentMarker.getId();
            data.name = value.name;
            data.width = this.currentMarker.defaultWidth;
            data.height = this.currentMarker.defaultHeight;
            data.x_loc = parseFloat(this.currentMarker.getCoordinates().x.toFixed(4));
            data.y_loc = parseFloat(this.currentMarker.getCoordinates().y.toFixed(4));
            this.currentMarker.remove();
            this.services.addBasePoint(data, (resData) => {
                console.log("Success to add basepoint.");
                this.handleClearSelectItem();
            }, (error) => {
                console.log("Fail to add basepoint.", error)
                this.handleClearSelectItem();
            });
        },
        handleAddBasePointCancelButton() {
            this.tunnelLayers[this.currentTunnelType].removeGeometry([this.currentMarker])
            this.currentMarker.remove();
            this.clearAll();
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
                    this.setCurrentTunnelId(_marker.getId());
                    this.setCurrentMarker(_marker);
                    this.setTunnelType(_marker.markerType);
                    this.setCurrentType(window.CONSTANTS.TYPE.SELECT_BASEPOINT);
                    e.domEvent.stopPropagation();
                }
            });
        },
        handleBasePointInfoOkButton(data) {
            this.services.updateBasePoint(data, (resData) => {
                console.log("Success to update basepoint.")
                this.setCurrentTunnelId(data.id);
            }, (error) => {
                console.log("Fail to update basepoint : ", error)
            });
        },
        handleBasePointInfoCloseButton() {
            this.handleClearSelectItem();
        },
        handleRemoveBasePoint(basePointId) {
            let data = {};
            data.id = basePointId;
            this.services.removeBasePoint(data, (resData) => {
                console.log("success to remove basepoint.")
                this.clearAll();
            }, (error) => {
                console.log("fail to remove basepoint : ", error)
            });
        },
        // ************* //
        // Handle Cavern //
        // ************* //
        handleAddCavern(basePointId) {
            this.handleClearSelectItemWithoutClear();
            this.setCurrentType(window.CONSTANTS.TYPE.ADD_TUNNEL);
            this.setTunnelType(window.CONSTANTS.TUNNEL_TYPE.CAVERN);
            let defaultLength = 100;
            let basePointInfo = this.$store.getters.getBasePoint(basePointId),
                width = parseFloat((window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH * defaultLength).toFixed(4)),
                height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.HEIGHT,
                xLocation = parseFloat((basePointInfo.x_loc + (window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.LOCATION_LENGTH * (defaultLength / 2))).toFixed(4));
                //xLocation = basePointInfo.x_loc + 6.5;
            // First is East  ( value == 0)
            // if (direction === window.CONSTANTS.DIRECTION.EAST) {
            //     xLocation += 6.5;
            // } else {
            //     xLocation -= 6.5;
            // }
            let marker = new maptalks.TextBox("", [xLocation, basePointInfo.y_loc],
                                              {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                                              {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}, {
                id: this._getUUID(),
                editable: false,
                draggable: true,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.colorMap[window.CONSTANTS.TUNNEL_TYPE.CAVERN],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                    textMaxHeight: {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}
                }
            });
            marker.defaultWidth = width;
            marker.defaultHeight = height;
            marker.markerType = window.CONSTANTS.TUNNEL_TYPE.CAVERN;
            marker.basepointId = basePointId;
            this.tunnelLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].addGeometry([marker]);
            this.setCurrentMarker(marker);
        },
        handleEditBlastCancel() {
            this.extraLayers.removeGeometry(this.currentMarker)
            this.currentMarker.remove();
            let currentMarkId = this.currentMarker.getId();
            if (currentMarkId in this.blastMarkers) {
                let typ = window.CONSTANTS.TUNNEL_TYPE.BLAST,
                    blast = this.$store.getters.getBlast(currentMarkId);
                if (!!blast) {
                    let tunnelData = this.$store.getters.getTunnel(blast.tunnel_id);
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
                            markerLineColor: this.colorMap[typ],
                            // TODO:
                            markerLineWidth: 1,
                            markerFill: this.colorMap[typ],
                            markerOpacity: 1
                    });
                }
            } else {
                this.clearCurrentMarker();
            }
            this.hidingMarker.show();
            if (this.hidingMarker != null) {
                this.hidingMarker.updateSymbol({
                        markerLineColor: '#000000',
                        markerLineWidth: 1,
                        markerFill: this.colorMap['selected'],
                        markerOpacity: 1
                });
            }
            this.setCurrentMarker(this.hidingMarker);
        },
        handleEditBlast(tunnelData, selectBlastID) {
            this.handleClearSelectItemWithoutClear();
            this.setCurrentTunnelId(tunnelData.id);

            let count = this.blastIdWithTunnel[tunnelData.id].length,
                lastBlastId = selectBlastID,
                lastBlastLength = this.$store.getters.getBlast(lastBlastId).blast_info.blasting_length,
                lastBlastMarker = this.blastMarkers[lastBlastId];
            lastBlastMarker.hide();
            this.hidingMarker = lastBlastMarker;
            if (count >= 1) {
                 var idIndex = this.blastIdWithTunnel[tunnelData.id].indexOf(selectBlastID);
                 lastBlastId = this.blastIdWithTunnel[tunnelData.id][idIndex + 1];
             }
            this.setLastBlastId(lastBlastId);
            let defaultBlastLength = lastBlastLength,
                position = this._getBlastPosition(tunnelData, lastBlastId, defaultBlastLength),
                blastWidth = parseFloat((defaultBlastLength * window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH).toFixed(4)),
                blastHeight = tunnelData.height;

            let _marker = new maptalks.TextBox("", position,
                                               {stops: [[4, blastWidth], [5, blastWidth * 2], [6, blastWidth * 4], [7, blastWidth * 8]]},
                                               {stops: [[4, blastHeight], [5, blastHeight * 2], [6, blastHeight * 4], [7, blastHeight * 8]]}, {
                id: this._getUUID(),
                editable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.colorMap['3'],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, blastWidth], [5, blastWidth * 2], [6, blastWidth * 4], [7, blastWidth * 8]]},
                    textMaxHeight: {stops: [[4, blastHeight], [5, blastHeight * 2], [6, blastHeight * 4], [7, blastHeight * 8]]}
                }
            });
            _marker.defaultWidth = blastWidth;
            _marker.defaultHeight = blastHeight;
            _marker.markerType = window.CONSTANTS.TUNNEL_TYPE.BLAST;
            this.extraLayers.addGeometry(_marker);
            this.setCurrentMarker(_marker);
        },
        handleEditChangeLengthBlast(tunnelData, blastLength, selectBlastID) {
            let count = this.blastIdWithTunnel[tunnelData.id].length,
                lastBlastId = this.blastIdWithTunnel[tunnelData.id][0];
            if (count >= 1) {
                 var idIndex = this.blastIdWithTunnel[tunnelData.id].indexOf(selectBlastID);
                 lastBlastId = this.blastIdWithTunnel[tunnelData.id][idIndex + 1];
             }
            let position = this._getBlastPosition(tunnelData, lastBlastId, blastLength),
                width = parseFloat((blastLength * window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH).toFixed(4));
            this.currentMarker.setCoordinates(position);
            this.currentMarker.setWidth({stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]});
            this.currentMarker.defaultWidth = width;
        },
        editCavern(basePointId, tunnelId) {
            this.handleClearSelectItemWithoutClear();
            let tunnelData = this.$store.getters.getTunnel(tunnelId),
                defaultLength = tunnelData.length,
                direction = tunnelData.direction,
                basePointInfo = this.$store.getters.getBasePoint(basePointId),
                width = parseFloat((window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH * defaultLength).toFixed(4)),
                height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.HEIGHT,
                xLocation = basePointInfo.x_loc;
            let marker = new maptalks.TextBox("", [xLocation, basePointInfo.y_loc],
                                              {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                                              {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}, {
                id: this._getUUID(),
                editable: false,
                draggable: true,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.colorMap[window.CONSTANTS.TUNNEL_TYPE.CAVERN],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                    textMaxHeight: {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}
                }
            });
            marker.defaultWidth = width;
            marker.defaultHeight = height;
            marker.markerType = window.CONSTANTS.TUNNEL_TYPE.CAVERN;
            marker.basepointId = basePointId;
            this.tunnelLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].addGeometry([marker]);
            this.setCurrentMarker(marker);
            this.handleChangeDirectionCavern(direction, defaultLength)
        },
        handleEditExDataClear(tunnelId) {
            this.currentMarker.remove();
            let tunnelData = this.$store.getters.getTunnel(tunnelId)
            this.clearCurrentMarker();
            this.setCurrentMarker(this.tunnelMarkers[tunnelData.category][tunnelId])
        },
        handleChangeDirectionCavern(direction, length) {
            let basePointInfo = this.$store.getters.getBasePoint(this.currentMarker.basepointId),
                xLocation = basePointInfo.x_loc;
            if (direction == window.CONSTANTS.DIRECTION.EAST ||
                direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                // xLocation += ((0.078 * length) / 2);
                xLocation += parseFloat((window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.LOCATION_LENGTH * (length / 2)).toFixed(4));
            } else {
                //xLocation -= ((0.078 * length) / 2);
                xLocation -= parseFloat((window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.LOCATION_LENGTH * (length / 2)).toFixed(4));
            }
            this.currentMarker.setCoordinates([xLocation, basePointInfo.y_loc]);
        },
        handleChangeLengthCavern(length, direction) {
            let basePointInfo = this.$store.getters.getBasePoint(this.currentMarker.basepointId),
                xLocation = basePointInfo.x_loc;
            if (direction == window.CONSTANTS.DIRECTION.EAST ||
                direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                //xLocation += ((0.078 * length) / 2);
                xLocation += parseFloat((window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.LOCATION_LENGTH * (length / 2)).toFixed(4));
            } else {
                //xLocation -= ((0.078 * length) / 2);
                xLocation -= parseFloat((window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.LOCATION_LENGTH * (length / 2)).toFixed(4));
            }
            this.currentMarker.setCoordinates([xLocation, basePointInfo.y_loc]);
            let width = parseFloat((window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH * length).toFixed(4));
            this.currentMarker.setWidth({stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]});
            this.currentMarker.defaultWidth = width;
        },
        handleAddTunnelOkButton(value) {
            const data = {}
            data.id = this.currentMarker.getId();
            data.name = value.tunnelName;
            data.section = value.tunnelSection;
            data.part = value.tunnelPart;
            data.category = value.category;
            data.direction = value.tunnelDirection;
            data.length = value.tunnelLength;
            data.tunnel_id = value.tunnelId;
            data.b_accum_length = 0;
            data.initial_b_time = null;
            data.x_loc = this.currentMarker.getCoordinates().x;
            data.y_loc = this.currentMarker.getCoordinates().y;
            data.width = this.currentMarker.defaultWidth;
            data.height = this.currentMarker.defaultHeight;
            data.basepoint_id = this.currentTunnelId;
            this.currentMarker.remove();
            this.services.addTunnel(data, (resData) => {
                console.log("success to add tunnel");
                this.blastIdWithTunnel[data.id] = [];
                this.handleClearSelectItem();
            }, (error) => {
                console.log("fail to add tunnel : ", error)
                this.handleClearSelectItem();
            });
        },
        handleAddTunnelCancelButton() {
            this.currentMarker.remove();
            this.clearAll();
        },
        _handleBlastClickEvent(marker) {
            marker.on('click', (e) => {
                this.handleClearSelectItem();
                let _marker = this.blastMarkers[marker.getId()];
                if (_marker != null) {
                    _marker.updateSymbol({
                            markerLineColor: '#000000',
                            markerLineWidth: 1,
                            markerFill: this.colorMap['selected'],
                            markerOpacity: 1
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
        _handleTunnelClickEvent(marker) {
            marker.on('click', (e) => {
                this.handleClearSelectItem();
                let _marker = this.tunnelMarkers[e.target.markerType][e.target.getId()];
                if (_marker != null) {
                    _marker.updateSymbol({
                            markerLineColor: '#000000',
                            markerLineWidth: 1,
                            markerFill: this.colorMap['selected'],
                            markerOpacity: 1
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
        handleUpdateTunnel() {
            if (this.currentMarker != null) {

            }
        },
        handleTunnelInfoOkButton(data) {
            data.x_loc = this.currentMarker.getCoordinates().x;
            data.y_loc = this.currentMarker.getCoordinates().y;
            data.width = this.currentMarker.defaultWidth;
            data.height = this.currentMarker.defaultHeight;
            this.services.updateTunnel(data, (resData) => {
                console.log("success to update tunnel")
                this.handleEditExDataClear(data.id);
            }, (error) => {
                console.log("fail to update tunnel : ", error)
            });
        },
        handleTunnelInfoCloseButton() {
            this.handleClearSelectItem();
        },
        handleRemoveTunnel(tunnelId) {
            let data = {};
            data.id = tunnelId;
            this.services.removeTunnel(data, (resData) => {
                console.log("success to remove tunnel")
                this.clearAll();
            }, (error) => {
                console.log("fail to remove tunnel : ", error)
            });
        },
        _getBlastPosition(tunnelData, oldBlastId, blastLength) {
            let xPosition = tunnelData.x_loc,
                yPosition = tunnelData.y_loc,
                _xPosition = 0,
                _yPosition = 0,
                _t = 0,
                _oldBlast = null;
            if (oldBlastId != null) {
                _oldBlast = this.$store.getters.getBlast(oldBlastId);
                xPosition = _oldBlast.x_loc;
                yPosition = _oldBlast.y_loc;
            }

            if (tunnelData.direction == window.CONSTANTS.DIRECTION.EAST ||
                tunnelData.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                tunnelData.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                let __t = null;
                if (_oldBlast != null) {
                    __t = parseFloat(((_oldBlast.width / 2) * 0.088).toFixed(4));
                    _t = xPosition + __t;
                } else {
                    __t = parseFloat(((tunnelData.width / 2) * 0.088).toFixed(4));
                    _t = xPosition - __t;
                }
                _xPosition = _t + parseFloat(((blastLength / 2) * window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.LOCATION_LENGTH).toFixed(4));
                _yPosition = yPosition;
            } else if (tunnelData.direction == window.CONSTANTS.DIRECTION.WEST ||
                tunnelData.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_WEST ||
                tunnelData.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_WEST) {
                let __t = null;
                if (_oldBlast != null) {
                    __t = parseFloat(((_oldBlast.width / 2) * 0.088).toFixed(4));
                    _t = xPosition - __t;
                } else {
                    __t = parseFloat(((tunnelData.width / 2) * 0.088).toFixed(4));
                    _t = xPosition + __t;
                }
                _xPosition = _t - parseFloat(((blastLength / 2) * window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.LOCATION_LENGTH).toFixed(4));
                _yPosition = yPosition;
            }
            return [_xPosition, _yPosition];
        },
        handleAddBlast(tunnelId, tunnelType) {
            this.handleClearSelectItem();
            this._handleAddBlast(tunnelId, tunnelType);
        },
        _handleChangeLengthBlast(tunnelId, lastBlastId, blastLength) {
            const tunnelData = this.$store.getters.getTunnel(tunnelId);
            let position = this._getBlastPosition(tunnelData, lastBlastId, blastLength),
                width = parseFloat((blastLength * window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH).toFixed(4)),
                height = tunnelData.height;
            this.currentMarker.setCoordinates(position);
            this.currentMarker.setWidth({stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]});
            this.currentMarker.defaultWidth = width;
        },
        _handleAddBlast(tunnelId, tunnelType) {
            this.setCurrentTunnelId(tunnelId);
            this.setCurrentType(window.CONSTANTS.TYPE.ADD_BLAST);
            const tunnelData = this.$store.getters.getTunnel(tunnelId),
                  data = {};

            let count = this.blastIdWithTunnel[tunnelId].length,
                lastBlastId = null;
            if (count >= 1) {
                lastBlastId = this.blastIdWithTunnel[tunnelId][0];
            }

            this.setLastBlastId(lastBlastId);
            let defaultBlastLength = 10,
                position = this._getBlastPosition(tunnelData, lastBlastId, defaultBlastLength),
                blastWidth = parseFloat((defaultBlastLength * window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH).toFixed(4)),
                blastHeight = tunnelData.height;

            let _marker = new maptalks.TextBox("", position,
                                               {stops: [[4, blastWidth], [5, blastWidth * 2], [6, blastWidth * 4], [7, blastWidth * 8]]},
                                               {stops: [[4, blastHeight], [5, blastHeight * 2], [6, blastHeight * 4], [7, blastHeight * 8]]}, {
                id: this._getUUID(),
                editable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.colorMap['3'],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, blastWidth], [5, blastWidth * 2], [6, blastWidth * 4], [7, blastWidth * 8]]},
                    textMaxHeight: {stops: [[4, blastHeight], [5, blastHeight * 2], [6, blastHeight * 4], [7, blastHeight * 8]]}
                }
            });
            _marker.defaultWidth = blastWidth;
            _marker.defaultHeight = blastHeight;
            _marker.markerType = window.CONSTANTS.TUNNEL_TYPE.BLAST;
            this.blastLayers[tunnelType].addGeometry(_marker);
            this.setCurrentMarker(_marker);
        },
        handleAddBlastOkButton(tunnelId, value) {
            const data = {'blast': {},
                          'info': {}},
                  blastId = this._getUUID();

            data.blast.id = blastId;
            data.blast.tunnel_id = tunnelId;
            data.blast.state = window.CONSTANTS.BLAST_STATE.IN_PROGRESS;
            data.blast.accum_time = 0;
            data.blast.m_accum_time = 0;
            data.blast.s_accum_time = 0;
            data.blast.i_accum_time = 0;
            data.blast.x_loc = this.currentMarker.getCoordinates().x;
            data.blast.y_loc = this.currentMarker.getCoordinates().y;
            data.blast.width = this.currentMarker.defaultWidth;
            data.blast.height = this.currentMarker.defaultHeight;
            data.info = value;
            data.info.blast_id = blastId;
            data.info.id = this._getUUID();

            this.blastIdWithTunnel[tunnelId].unshift(data.blast.id);
            this.services.addBlast(data, (resData) => {
                console.log("success to add blast.")
                this.currentMarker.remove();
                this.handleClearSelectItem();
            }, (error) => {
                this.currentMarker.remove();
                this.blastIdWithTunnel[tunnelId] = this._.without(this.blastIdWithTunnel[tunnelId], data.id);
                this.handleClearSelectItem();
                console.log("fail to add blast. Error : ", error)
            });
        },
        handleAddBlastCancelButton() {
            this.currentMarker.remove();
            this.handleClearSelectItem();
        },
        handleBlastInfoOkButton(blastInformationData, tunnelData, blastData) {
            // this.handleClearSelectItem();
            const data = {'blast': {},
                          'info': {}};
            data.blast = blastData;
            data.blast.x_loc = this.currentMarker.getCoordinates().x;
            data.blast.y_loc = this.currentMarker.getCoordinates().y;
            data.blast.width = this.currentMarker.defaultWidth;
            data.blast.height = this.currentMarker.defaultHeight;
            data.info = blastInformationData;
            this.services.updateBlastInfo(data, (resData) => {
                console.log("success to update blast info")
                this.hidingMarker.show();
                this.handleEditExDataClear(tunnelData.id);
            }, (error) => {
                console.log("fail to update blast info : ", error)
            });
        },
        handleBlastEditClose() {
            this.extraLayers.removeGeometry(this.currentMarker)
            this.currentMarker.remove();
            this.hidingMarker.show();
        },
        handleBlastInfoCloseButton() {
            this.handleClearSelectItem();
        },
        _drawBlast(blast, isUpdated) {
            const tunnelData = this.$store.getters.getTunnel(blast.tunnel_id),
                  position = [blast.x_loc, blast.y_loc],
                  blastWidth = blast.width,
                  blastHeight = blast.height;
            let typ = window.CONSTANTS.TUNNEL_TYPE.BLAST;
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

            let _marker = new maptalks.TextBox("", position,
                                               {stops: [[4, blastWidth], [5, blastWidth * 2], [6, blastWidth * 4], [7, blastWidth * 8]]},
                                               {stops: [[4, blastHeight], [5, blastHeight * 2], [6, blastHeight * 4], [7, blastHeight * 8]]}, {
                id: blast.id,
                editable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: this.colorMap[typ],
                    markerLineWidth: 1,
                    markerFill: this.colorMap[typ],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, blastWidth], [5, blastWidth * 2], [6, blastWidth * 4], [7, blastWidth * 8]]},
                    textMaxHeight: {stops: [[4, blastHeight], [5, blastHeight * 2], [6, blastHeight * 4], [7, blastHeight * 8]]}
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
            // TODO:
            // this.setBlastContextMenu(_marker, tunnelData.tunnel_id);
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
        handleAddWork(blastId) {
            let workIdList = this.workIdWithBlast[blastId][0],  // 0 is Main Work
                supportingIdList = this.workIdWithBlast[blastId][1],
                idelTimeIdList = this.workIdWithBlast[blastId][2],
                latestWork = null,
                data = {};
            if (workIdList.length > 0) {
                latestWork = this.$store.getters.getWork(workIdList[0]);
                if (latestWork.state === window.CONSTANTS.WORK_STATE.FINISH) {
                    if (latestWork.typ === window.CONSTANTS.MAIN_WORK.BLASTING) {
                        this.sweetbox.fire("Activity cycle is finish. Please add to new activity.");
                    } else {
                        this.setCurrentType(window.CONSTANTS.TYPE.ADD_WORK);
                    }
                } else {
                    this.sweetbox.fire("The activity was not finished.")
                }
            } else {
                this.setCurrentType(window.CONSTANTS.TYPE.ADD_WORK);
            }
        },
        handleRemoveBlast(blastId) {
            let data = {};
            data.id = blastId;
            this.services.removeBlast(data, (resData) => {
                    console.log("success to remove blast.");
                    this.clearAll();
            }, (error) => {
                console.log("fail to remove blast : ", error)
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
                    markerLineColor: this.colorMap[typ],
                    // TODO:
                    markerLineWidth: 1,
                    markerFill: this.colorMap[typ],
                    markerOpacity: 1
            });
            this.clearCurrentType();
            this.clearCurrentTunnelId();
            this.clearTunnelType();
            this.clearCurrentBlastId();
            this.clearBlastType();
            this.clearCurrentWorkId();
            this.clearLastBlastId();
        },
        handleWorkAddOkButton(value) {
            let data = {};
            data.id = this._getUUID();
            data.category = value.category;
            data.typ = value.activity;
            data.state = window.CONSTANTS.WORK_STATE.STOP
            data.accum_time = 0;
            data.p_accum_time = 0;
            data.blast_id = value.blastId;
            if ('is_data_build' in value) {
                data.is_data_build = value.is_data_build;
                data.start_time = value.start_time;
                data.finish_time = value.finish_time;
            }
            if (this.workIdWithBlast[value.blastId][value.category].length == 0) {
                this.workIdWithBlast[value.blastId][value.category].push(data.id); // TODO:
            } else {
                this.workIdWithBlast[value.blastId][value.category].unshift(data.id); // TODO:
            }
            if (!!!data.is_data_build) {
                this.services.addWork(data, (resData) => {
                    console.log("success to add Work")
                    this.setCurrentBlastId(data.blast_id);
                    this.setCurrentWorkId(data.id);
                    this.setCurrentType(window.CONSTANTS.TYPE.SELECT_WORK);
                    if (!(data.id in this.pauseIdWithWork)) {
                        this.pauseIdWithWork[data.id] = [];
                    }
                }, (error) => {
                    console.error("Failed to add work.", error);
                    this.workIdWithBlast[value.blastId][value.category] = this._.without(this.workIdWithBlast[data.blastId][value.category], data.id);
                });
                this.clearAll();
            } else {
                data.state = window.CONSTANTS.WORK_STATE.FINISH;
                data.accum_time = data.finish_time - data.start_time;
                this.services.addCompletedWork(data, (resData) => {
                    console.log("success to add completed work")
                }, (error) => {
                    console.error("Failed to add work.", error);
                    this.workIdWithBlast[value.blastId][value.category] = this._.without(this.workIdWithBlast[data.blastId][value.category], data.id);
                });
                this.clearAll();
            }
        },
        handleWorkInfoCloseButton(blast) {
            this.clearForBlastData(blast);
        },
        handleWorkInfoCancelButton() {
            this.currentMarker.updateSymbol({
                    markerLineColor: '#000000',
                    // TODO:
                    markerLineWidth: 1,
                    markerFill: '#ff0000',
                    markerOpacity: 1
            });
            this.clearAll();
        },
        handleWorkInfoOkButton(workData) {
            this.services.updateWork(workData, (resData) => {
                console.log("success to update work", workData);
                this.currentMarker.updateSymbol({
                        markerLineColor: '#000000',
                        // TODO:
                        markerLineWidth: 1,
                        markerFill: '#ff0000',
                        markerOpacity: 1
                });
                this.clearAll();
            }, (error) => {
                console.log("fail to update work : ", error);
                this.currentMarker.updateSymbol({
                        markerLineColor: '#000000',
                        // TODO:
                        markerLineWidth: 1,
                        markerFill: '#ff0000',
                        markerOpacity: 1
                });
                this.clearAll();
            });
        },
        handleWorkRemoveButton(data) {
            this.services.removeWork(data, (resData) => {
                console.log("Success to remove work : ")
                this.clearAll();
            }, (error) => {
                console.log("Failed to remove work")
            });
        },
        drawWork(blast) {
            // TODO:
            if (blast.state === window.CONSTANTS.BLAST_STATE.IN_PROGRESS) {
                let tmp = this.workIdWithBlast[blast.id][0],  // 0 is Main Work
                    tmp1 = this.workIdWithBlast[blast.id][1],  // 1 is Supporting
                    tmp2 = this.workIdWithBlast[blast.id][2],  // 2 is Idle
                    latestWork = null,
                    latestSupporting = null,
                    latestIdle = null,
                    latestTmpData = null,
                    currentCategory = null,
                    currentTyp = null,
                    currentWorkId = null;

                if (tmp.length > 0) {
                    latestWork = this.$store.getters.getWork(tmp[0]);
                    if (latestWork.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS ||
                        latestWork.state == window.CONSTANTS.WORK_STATE.STOP) {
                        latestTmpData = latestWork;
                        currentCategory = latestWork.category;
                        currentTyp = latestWork.typ;
                        currentWorkId = latestWork.id;
                    } else {
                        latestTmpData = latestWork;
                        currentCategory = latestWork.category;
                        currentTyp = latestWork.typ;
                        currentWorkId = latestWork.id;
                    }
                }
                if (tmp1.length > 0) {
                    latestSupporting = this.$store.getters.getWork(tmp1[0]);
                    if (latestSupporting.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS ||
                        latestSupporting.state == window.CONSTANTS.WORK_STATE.STOP) {
                        currentCategory = latestSupporting.category;
                        currentTyp = latestSupporting.typ;
                        currentWorkId = latestSupporting.id;
                    } else {
                        if (latestTmpData != null) {
                            if (latestTmpData.last_updated_time < latestSupporting.last_updated_time) {
                                latestTmpData = latestSupporting;
                                currentCategory = latestSupporting.category;
                                currentTyp = latestSupporting.typ;
                                currentWorkId = latestSupporting.id;
                            }
                        } else {
                            latestTmpData = latestSupporting;
                            currentCategory = latestSupporting.category;
                            currentTyp = latestSupporting.typ;
                            currentWorkId = latestSupporting.id;
                        }
                    }
                }
                if (tmp2.length > 0) {
                    latestIdle = this.$store.getters.getWork(tmp2[0]);
                    if (latestIdle.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS ||
                        latestIdle.state == window.CONSTANTS.WORK_STATE.STOP) {
                        currentCategory = latestIdle.category;
                        currentTyp = latestIdle.typ;
                        currentWorkId = latestIdle.id;
                    } else {
                        if (latestTmpData != null) {
                            if (latestTmpData.last_updated_time < latestIdle.last_updated_time) {
                                latestTmpData = latestIdle;
                                currentCategory = latestIdle.category;
                                currentTyp = latestIdle.typ;
                                currentWorkId = latestIdle.id;
                            }
                        } else {
                            latestTmpData = latestIdle;
                            currentCategory = latestIdle.category;
                            currentTyp = latestIdle.typ;
                            currentWorkId = latestIdle.id;
                        }
                    }
                }
                let fileUrl = '';
                if (currentCategory != null && currentTyp != null) {
                    if (currentCategory == window.CONSTANTS.CATEGORY.MAIN_WORK) {
                        fileUrl =`${ window.CONSTANTS.URL.BASE_IMG }${ window.CONSTANTS.URL.MAIN[currentTyp] }`;
                    } else if (currentCategory == window.CONSTANTS.CATEGORY.SUPPORTING) {
                        fileUrl =`${ window.CONSTANTS.URL.BASE_IMG }${ window.CONSTANTS.URL.SUPPORTING[currentTyp] }`;
                    } else {
                        fileUrl =`${ window.CONSTANTS.URL.BASE_IMG }${ window.CONSTANTS.URL.IDLE[currentTyp] }`;
                    }
                }

                if (fileUrl !== '') {
                    let marker = new maptalks.Marker(
                        // Origin (200623)
                        // [blast.x_loc, blast.y_loc + 0.4], {
                        [blast.x_loc, blast.y_loc + 0.05], {
                            id: blast.id,  // TODO:
                            symbol: {
                                'markerFile': fileUrl,
                                'markerWidth': {stops: [[4, 20], [5, 30], [6, 50], [7, 80]]},
                                'markerHeight': {stops: [[4, 20], [5, 30], [6, 50], [7, 80]]}
                                // Origin (200623)
                                // 'markerDy': {stops:[[4, 10], [5, 20], [6, 30], [7, 40]]}
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
        _zoomIn() {
            if (!!this.map) {
                this.map.zoomIn(7);
            }
        },
        _zoomOut() {
            if (!!this.map) {
                this.map.zoomOut(6);
            }
        },
        closeMenu() {
            if (this.contextMenuItem !== null) {
                this.contextMenuItem.closeMenu();
                this.contextMenuItem = null;
            }
            this.map.closeMenu();
        },
        closeInfoWindow() {
            if (this.infoWindowItem !== null) {
                this.infoWindowItem.closeInfoWindow();
                this.infoWindowItem = null;
            }
            this.map.closeMenu();
        },
        setTunnelInfoWindow(marker) {
            marker.updateSymbol({
                lineColor: '#000000',
                lineWidth: 1,
                polygonFill: '#929292',
                polygonOpacity: 1
            });

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
        setContextMenu(marker) {
            marker.on('contextmenu', () => {
                this.closeInfoWindow();
                document.getElementById('add-button').onclick = () => {
                    this.closeMenu();
                }
                document.getElementById('edit-button').onclick = () => {
                    if (marker.isEdit) {
                        marker.isEdit = false;
                        marker.endEdit();
                    } else {
                        marker.isEdit = true;
                        marker.startEdit();
                    }
                    this.closeMenu();
                    console.log("### edit marker : ", marker);
                }
                document.getElementById('remove-button').onclick = () => {
                    const data = {};
                    this.closeMenu();
                    data.prog_id = marker._id
                    this.services.removeBlast(data, (resData) => {
                        marker.remove();
                        this.$store.commit('removeBlast', marker._id);
                        console.log("Success to remove blast")
                    }, (error) => {
                        console.log("Failed to remove blast")
                    });
                }
            });
        },
        _setContextMenuPosition() {
            if (this.isShowingContextMenu) {
                const marker = this.markers[this.contextMenuItem.id],
                      _coordinates = marker._coordinates,
                      _position = this.map.coordinateToContainerPoint(_coordinates, this.zoomLevel);
                this.markerPosition = {
                    x: _position.x,
                    y: _position.y
                }
            }
        },
        _showWindow() {
            console.log(coordinate)
            infoWindow.addTo(this.map).show({x: coordinate.x + 20, y: coordinate.y + 10});
        },
        _handleFilterGroup(item, checked) {
            // TODO: filter function
            if (checked) {
                // this.paLayers[item].show();
                // this.polygonLayers[item].show();
                this.filterList = this._.without(this.filterList, item);
            } else {
                // this.paLayers[item].hide();
                // this.polygonLayers[item].hide();
                this.filterList.push(item);
            }
        },
        isShowingTopList(type) {
            return this.isTopPressedType === type;
        },
        handleTopButton(type) {
            this.infoWindowItem = null;
            const _type = this.isTopPressedType;
            this.isTopPressedType = '';

            this.$nextTick(() => {
                if (_type === type) {
                    this.isTopPressedType = '';
                } else {
                    this.isTopPressedType = type;
                }
                if (type === window.CONSTANTS.TOP_BUTTON_TYPE.PLUS) {
                    this._zoomIn();
                    this._setContextMenuPosition();
                } else if (type === window.CONSTANTS.TOP_BUTTON_TYPE.MINUS) {
                    this._zoomOut();
                    this._setContextMenuPosition();
                } else if (type === window.CONSTANTS.TOP_BUTTON_TYPE.WINDOW) {
                    this.isShowLegend = !this.isShowLegend;
                } else if (type === window.CONSTANTS.TOP_BUTTON_TYPE.FILTER) {
                }
            });
        },
        // websocket function
        websocketConnect() {
            let url = window.location.hostname;
            if (window.CONSTANTS.IS_DEV) {
                // url = '192.168.0.15';
                // url = '0.0.0.0'
                url = '127.0.0.1';
            }
            this.services.websocketConnect(url, 5555, () => {
                console.log("Connect with websocket");
                this.isWebsocketConnected = true;
                this.stopInterval();
                this.subscribe();
            }, () => {
                console.warn("Disconnect with websocket");
                this.isWebsocketConnected = false;
                this.startInterval();
            }, () => {
                console.error("Error");
            });
        },
        startInterval() {
            if (!!!this.checkInterval) {
                this.checkInterval = setInterval(() => {
                    // this.websocketConnect();
                }, 10000);
            }
        },
        stopInterval() {
            if (!!this.checkInterval) {
                clearInterval(this.checkInterval);
            }
            this.checkInterval = null;
        },
        subscribe() {
            this.services.subscribe(this.info.internal, {
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
                updateWorkEquipmentList: (data) => {
                    this._handleUpdateWorkEquipmentList(data);
                },
                updateMessageList: (data) => {
                    this._handleUpdateMessageList(data);
                },
                updateTeamList: (data) => {
                    this._handleUpdateTeamList(data);
                },
            });
        },
        _handleUpdateBasePointList(data) {
            const list = data.v;
            this._.forEach(list, item => {
                if (data.kind === 'add') {
                    let basePoint = this.$store.getters.getBasePoint(item.id);
                    if (basePoint === null || basePoint === undefined) {
                        this._drawBasePoint(item);
                    }
                    this.$store.commit('addBasePoint', item);
                } else if (data.kind === 'remove') {
                    let basePoint = this.$store.getters.getBasePoint(item),
                        typ = window.CONSTANTS.TUNNEL_TYPE.BASEPOINT;
                    if (basePoint !== null || basePoint !== undefined) {
                        let basePointMarker = this.basePointMarkers[typ][item];
                        basePointMarker.remove();
                        delete this.basePointMarkers[typ][item];
                        this.$store.commit('removeBasePoint', item);
                    }
                } else if (data.kind === 'update') {
                    this.$store.commit('updateBasePoint', item);
                }
            });
        },
        _handleUpdateTunnelList(data) {
            const list = data.v;
            this._.forEach(list, item => {
                if (data.kind === 'add') {
                    let tunnel = this.$store.getters.getTunnel(item.id);
                    if (tunnel === null || tunnel === undefined) {
                        this._drawTunnel(item);
                    }
                    this.$store.commit('addTunnel', item);
                } else if (data.kind === 'remove') {
                    let tunnel = this.$store.getters.getTunnel(item),
                        typ = tunnel.category;
                    if (tunnel !== null || tunnel !== undefined) {
                        let tunnelMarker = this.tunnelMarkers[typ][item];
                        tunnelMarker.remove();
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
                            markerFill: this.colorMap[typ]
                        });
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
                    this.$store.commit('updatePause', item);
                    this.$refs.workInfoView.refreshPauseList();
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
                        this.workEquipmentList = this._.without(this.workEquipmentList, item);
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
    },
    computed: {
        isShowingInfoWindow() {
            return !this._.isEmpty(this.infoWindowItem);
        },
        isShowingContextMenu() {
            return !this._.isEmpty(this.contextMenuItem);
        }
    },
    mounted() {
        this._initLoadMap();
    },
    created() {
        console.log("Create Main vue");
         this.services.getInfo(info => {
            if (this._.isObject(info)) {
                console.log("Succeed to get info ", info);
                this.info = info;
                this.websocketConnect();
                // this.startInterval();
            }
        });
        window.addEventListener("beforeunload", () => {
            this.services.unsubscribe();
        });
    }
}
</script>
<style>
::-webkit-scrollbar {
    display: none;
}
div {
    box-sizing: border-box;
}
.main-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: -15px;
    left: 0;
}
.map-container {
    width: 100%;
    height: calc(100% - 40px);
}
.file-input {
    display: none !important;
}


.custom_menu {
    width: 200px;
    padding-top: 2px;
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
    font-size: 14px;
    font-weight: 600;
    font-family: initial;
    letter-spacing: 0.6px;
    line-height: 40px;
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

.content {
    width: 360px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 11px 11px 20px #aaaaaa99;
    color: #999999;
}
.row {
}
.column {
    display: inline-block;
    width: 120px;
}
.pop_title {
    background-color: #09b8e6;
    color: #ffffff;
    height: 30px;
    text-align: center;
    line-height: 2;
}
.sub-row {
}
.item {
    text-align: center;
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