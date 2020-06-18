<template>
    <div id="main" class="main-container">
        <Top :selectedType="isTopPressedType" @select-top-button="handleTopButton"></Top>
        <AddBasePoint :type="getCurrentType()"
            @select-ok-button="handleAddBasePointOkButton"
            @select-cancel-button="handleAddBasePointCancelButton"></AddBasePoint>
        <BasePointInfo :type="getCurrentType()" :id="currentTunnelId"
            @select-ok-button="handleBasePointInfoOkButton"
            @select-cancel-button="handleBasePointInfoCancelButton"
            @select-close-button="handleBasePointInfoCloseButton"
            @select-add-cavern-button="handleAddCavern"
            @select-remove-basepoint-button="handleRemoveBasePoint"></BasePointInfo>
        <AddTunnel :type="getCurrentType()"
            @change-tunnel-direction="handleChangeDirectionCavern"
            @select-ok-button="handleAddTunnelOkButton"
            @select-cancel-button="handleAddTunnelCancelButton"></AddTunnel>
        <TunnelInfo :type="getCurrentType()" :id="currentTunnelId"
            @select-ok-button="handleTunnelInfoOkButton"
            @select-close-button="handleTunnelInfoCloseButton"
            @select-add-blast-button="handleAddBlast"
            @select-remove-tunnel-button="handleRemoveTunnel"></TunnelInfo>
        <AddBlast :type="getCurrentType()" :tunnelId="currentTunnelId"
            @select-ok-button="handleAddBlastOkButton"
            @select-cancel-button="handleAddBlastCancelButton"></AddBlast>
        <BlastInfo :type="getCurrentType()" :id="currentBlastId"
            :workIdList="getWorkList()"
            :supportingIdList="getSupportingList()"
            :idleIdList="getIdleList()"
            @select-information-button="handleBlastInfoInformationButton"
            @select-close-button="handleBlastInfoCloseButton"
            @select-add-work-button="handleAddWork"
            @select-work-item="handleSelectWorkItem"></BlastInfo>
        <BlastInformation :type="getCurrentType()" :id="currentBlastId"
            @select-ok-button="handleBlastInfoOkButton"
            @select-close-button="handleBlastInfoCloseButton"></BlastInformation>
        <AddWork :type="getCurrentType()" :blastId="currentBlastId"
            @select-cancel-button="handleWorkAddCancelButton"
            @select-ok-button="handleWorkAddOkButton"></AddWork>
        <WorkInfo :type="getCurrentType()" :blastId="currentBlastId"
            :id="currentWorkId" :pauseList="getPauseList()"
            :operatorList="getOperatorList()" :equipmentList="getEquipmentList()"
            :workOperatorList="workOperatorList"
            :workEquipmentList="workEquipmentList"
            @select-cancel-button="handleWorkInfoCancelButton"
            @select-ok-button="handleWorkInfoOkButton"
            @select-close-button="handleWorkInfoCloseButton"
            @select-remove-work-button="handleWorkRemoveButton"></WorkInfo>
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
        WorkInfo
    },
    data() {
        return {
            id: 'map',
            info: {},
            map: null,
            basePointLayers: {},  // {t_type: layer}
            tunnelLayers: {},  // {t_type: layer}
            blastLayers: {},  // {t_type : layer}
            workLayers: {},
            zoomLevel: 0,
            basePointMarkers: {},  // {t_type: {bp_id: bp_marker}}
            tunnelMarkers: {},    // {t_type: {t_id: t_marker}}
            blastMarkers: {},  // {b_id: b_marker, ..}
            blastIdWithTunnel: {},    // {t_id: [b_id, ..]}
            workIdWithBlast: {},    // {b_id: {0: [w_id, ..], 1: [w_id, ..], 2: [w_id, ..]}} 0(MainWork), 1(Supporting), 2(IdelTime)
            pauseIdWithWork: {},  // {w_id: [p_id, ..]}
            markers: {},
            infoWindowItem: null,
            addWindowItem: null,
            contextMenuItem: null,
            windowItem: null,
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
            workOperatorList: [],
            workEquipmentList: [],
            //
            currentType: null,
            currentTunnelId: null,
            currentTunnelType: null,
            currentBlastId: null,
            currentWorkId: null,
            currentBlastType: null,
            currentMarker: null,
            //
            blastLayer: null,
            workLayer: null,
            colorMap: {
                'selected': '#dddddd',
                '0': '#a0a0ff',
                '1': '#00aabb',
                '3': '#ff0000',
                '4': '#0000ff',
                '100': '#00aabb',
                '101': '#0070c0',
                '102': '#92d050',
                '1000': '#00b050',
                '1001': '#ffcd8c',
                '1002': '#a05900',
            }
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
                        this.basePointLayers[value].setZIndex(100);
                        this.basePointMarkers[value] = {};
                    });
                    this._getActivityList();
                    this._getEquipmentList();
                    this._getOperatorList();
                    this._getEquipmentInfoList();
                    this._getBasePointList();
                    this.blastLayer = new maptalks.VectorLayer('vector').addTo(this.map);
                    this.blastLayer.setZIndex(2);
                    this.workLayer = new maptalks.VectorLayer('vector1').addTo(this.map);
                    this.workLayer.setZIndex(101);
                });
                this.map.on('zoomend moveend', (e) => {
                    this.zoomLevel = 50 * (this.map.getZoom() / 11);
                    this._setContextMenuPosition();
                });
                this.map.on('click', (e) => {
                    console.log("##### x : " +  e.coordinate.x + " Y : " + e.coordinate.y);
                    this.closeInfoWindow();
                    this.closeAddWindow();
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
        _getActivityList() {
            this.services.getActivityList(activityList => {
                // TODO:
                console.log("Success to get activity list.", activityList);
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
        _getEquipmentInfoList() {
            this.services.getEquipmentInfoList(equipmentInfoList => {
                // TODO:
                console.log("Success to get equipment info list.", equipmentInfoList);
            }, (error) => {
                console.log("Failed to get equipment info list.", error);
            });
        },
        _getBasePointList() {
            this.services.getBasePointList(basePointList => {
                console.log("Success to get basepoint list.");
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
                console.log("Success to get tunnels");
                this._.forEach(tunnels, tunnel => {
                    this.tunnelIDList.push(tunnel.id);
                    this.blastIdWithTunnel[tunnel.id] = [];
                    this._drawTunnel(tunnel);
                });
                this._getWorkList();
            }, (error) => {
                console.log("Failed to get tunnel list.", error);
            });
        },
        _getWorkList() {
            this.services.getWorkList(resData => {
                this._.forEach(resData, (work) => {
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

                    this.$store.commit('addWork', work);
                });
                this._getPauseList();
                this._getBlastList();
            }, (error) => {
                console.log("Failed to get work list.", error);
            });
        },
        _getPauseList() {
            this.services.getPauseList(resData => {
                this._.forEach(resData, (pause) => {
                    if (!(pause.work_id in this.pauseIdWithWork)) {
                        this.pauseIdWithWork[pause.work_id] = [];
                    }
                    this.pauseIdWithWork[pause.work_id].push(pause.id);
                    this.$store.commit('addPause', pause);
                });
            });
        },
        _getBlastList() {
            this.services.getBlastList(blastList => {
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
                    this._drawBlast(blast);
                    this.blastIDList.push(blast.id);
                });
                this._getBlastInfoList();
            }, (error) => {
                console.log("Failed to get blast list.", error);
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
            var marker = new maptalks.TextBox("", [xPosition, yPosition],
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
            this.tunnelLayers[typ].addGeometry([marker]);
            this.tunnelMarkers[typ][tunnel.id] = marker;
            this.$store.commit('addTunnel', tunnel);
            this._handleTunnelClickEvent(marker);
            // TODO: right click?
            marker.on('contextmenu', () => {});
        },
        _fixDrawTunnel(tunnel){
            var _marker = this.tunnelLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].getGeometryById(tunnel.id)
            this.tunnelLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].removeGeometry([_marker])
            this._drawTunnel(tunnel);
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
        clearAll() {
            this.clearCurrentType();
            this.clearCurrentMarker();
            this.clearCurrentTunnelId();
            this.clearTunnelType();
            this.clearCurrentBlastId();
            this.clearBlastType();
            this.clearCurrentWorkId();
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
                this.closeWindow();
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
                this.currentMarker.updateSymbol({
                        markerLineColor: this.colorMap[this.currentMarker.markerType],
                        markerLineWidth: 1,
                        markerFill: this.colorMap[this.currentMarker.markerType],
                        markerFillOpacity: 1
                });
                this.clearAll();
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
            data.x_loc = this.currentMarker.getCoordinates().x;
            data.y_loc = this.currentMarker.getCoordinates().y;
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
            this.handleClearSelectItem();
            // TODO: call update api
        },
        handleBasePointInfoCancelButton() {
            this.handleClearSelectItem();
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
            this.setCurrentType(window.CONSTANTS.TYPE.ADD_TUNNEL);
            this.setTunnelType(window.CONSTANTS.TUNNEL_TYPE.CAVERN);
            let basePointInfo = this.$store.getters.getBasePoint(basePointId),
                width = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH,
                height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.HEIGHT,
                xLocation = basePointInfo.x_loc + 6.5;
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
        handleChangeDirectionCavern(direction) {
            let basePointInfo = this.$store.getters.getBasePoint(this.currentMarker.basepointId),
                xLocation = basePointInfo.x_loc;
            if (direction == window.CONSTANTS.DIRECTION.EAST) {
                xLocation += 6.5;
            } else {
                xLocation -= 6.5;
            }
            this.currentMarker.setCoordinates([xLocation, basePointInfo.y_loc]);
        },
        handleAddTunnelOkButton(value) {
            const data = {}
            data.id = this.currentMarker.getId();
            data.name = value.tunnelName;
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
            this.handleClearSelectItem();
            this.services.updateTunnel(data, (resData) => {
                console.log("success to update tunnel")
                this.clearAll();
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
        _getBlastPosition(tunnelData, count) {
            let xPosition = tunnelData.x_loc,
                yPosition = tunnelData.y_loc,
                _xPosition = 0,
                _yPosition = 0;

            if (tunnelData.direction == window.CONSTANTS.DIRECTION.EAST) {
                _xPosition = (xPosition - ((tunnelData.width / 2) / 11.25));
                _yPosition = yPosition;

                _xPosition += (((10 / 2) / 11.25) * count);
                if (count > 1) {
                    _xPosition += (((10 / 2) / 11.25));
                }
            } else if (tunnelData.direction == window.CONSTANTS.DIRECTION.WEST) {
                _xPosition = (xPosition + ((tunnelData.width / 2) / 11.25));
                _yPosition = yPosition;

                _xPosition -= (((10 / 2) / 11.25) * count);
                if (count > 1) {
                    _xPosition -= (((10 / 2) / 11.25));
                }
            }
            return [_xPosition, _yPosition];
        },
        handleAddBlast(tunnelId, tunnelType) {
            if (this.blastIdWithTunnel[tunnelId].length > 0) {
                let latestBlast = this.$store.getters.getBlast(this.blastIdWithTunnel[tunnelId][this.blastIdWithTunnel[tunnelId].length - 1]);
                if (latestBlast.state === window.CONSTANTS.BLAST_STATE.FINISH) {
                    this._handleAddBlast(tunnelId, tunnelType);
                } else {
                    this.sweetbox.fire("The operation was not finished.");
                }
            } else {
                this._handleAddBlast(tunnelId, tunnelType);
            }
        },
        _handleAddBlast(tunnelId, tunnelType) {
            this.setCurrentTunnelId(tunnelId);
            // this.setCurrentType(window.CONSTANTS.TYPE.ADD_BLAST);
            const tunnelData = this.$store.getters.getTunnel(tunnelId),
                  data = {};

            let count = this.blastIdWithTunnel[tunnelId].length;
            console.log("##### count : ", count);
            // TODO:  ????
            if (count === 0) {
                count = 1;
            } else if (count === 1) {
                count += 1;
            } else {
                count += 2;
            }

            let position = this._getBlastPosition(tunnelData, count),
                blastWidth = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.BLAST.WIDTH,
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
            this.currentMarker = _marker;
            let bif = {
                explosive: 0,
                detonator: 0,
                drilling_depth: 0,
                blasting_date: null,
                blasting_time: null,
                start_point: 0,
                finish_point: 0,
                blasting_length: 0
            }
            this.handleAddBlastOkButton(tunnelId, bif);
        },
        handleAddBlastOkButton(tunnelId, value) {
            const data = {'blast': {},
                          'info': {}},
                  tunnelData = this.$store.getters.getTunnel(tunnelId),
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

            this.blastIdWithTunnel[tunnelId].push(data.id);
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
        handleBlastInfoInformationButton(blastId) {
            this.setCurrentType(window.CONSTANTS.TYPE.SELECT_BLAST_INFORMATION);
            //this.handleClearSelectItem();
        },
        handleBlastInfoOkButton(data) {
            this.handleClearSelectItem();
            this.services.updateBlastInfo(data, (resData) => {
                console.log("success to update blast info")
            }, (error) => {
                console.log("fail to update blast info : ", error)
            });
        },
        handleBlastInfoCloseButton() {
            this.handleClearSelectItem();
        },
        _drawBlast(blast) {
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
            this.blastIdWithTunnel[tunnelData.id].push(blast.id);
            this.$store.commit('addBlast', blast);
            this._handleBlastClickEvent(_marker)
            this.blastLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].addGeometry(_marker);
            this.drawWork(blast);
        },
        handleSelectWorkItem(workId) {
            this.services.getWorkDataByWork({"work_id": workId}, (resData) => {
                console.log("Success to get work Data list", resData);
                this.workOperatorIdList = [];
                this.workEquipmentIdList = [];

                this._.forEach(resData.operator, workOperator => {
                    this.workOperatorList.push(workOperator);
                });
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
        handleWorkAddCancelButton() {
            this.currentMarker.updateSymbol({
                    markerLineColor: '#000000',
                    // TODO:
                    markerLineWidth: 1,
                    markerFill: '#ff0000',
                    markerOpacity: 1
            });
            this.clearAll();
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
            if (this.workIdWithBlast[value.blastId][value.category].length == 0) {
                this.workIdWithBlast[value.blastId][value.category].push(data.id); // TODO:
            } else {
                this.workIdWithBlast[value.blastId][value.category].unshift(data.id); // TODO:
            }
            this.services.addWork(data, (resData) => {
                console.log("success to add Work")
                this.setCurrentWorkId(data.id);
                this.setCurrentType(window.CONSTANTS.TYPE.SELECT_WORK);
                if (!(data.id in this.pauseIdWithWork)) {
                    this.pauseIdWithWork[data.id] = [];
                }
            }, (error) => {
                console.error("Failed to add work.", error);
                this.workIdWithBlast[value.blastId][value.category] = this._.without(this.workIdWithBlast[data.blastId][value.category], data.id);
                this.clearAll();
            });
        },
        handleWorkInfoCloseButton() {
            this.handleClearSelectItem();
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
                    currentTyp = null;

                if (tmp.length > 0) {
                    latestWork = this.$store.getters.getWork(tmp[0]);
                    if (latestWork.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS ||
                        latestWork.state == window.CONSTANTS.WORK_STATE.STOP) {
                        latestTmpData = latestWork;
                        currentCategory = latestWork.category;
                        currentTyp = latestWork.typ;
                    } else {
                        latestTmpData = latestWork;
                        currentCategory = latestWork.category;
                        currentTyp = latestWork.typ;
                    }
                }
                if (tmp1.length > 0) {
                    latestSupporting = this.$store.getters.getWork(tmp1[0]);
                    if (latestSupporting.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS ||
                        latestSupporting.state == window.CONSTANTS.WORK_STATE.STOP) {
                        currentCategory = latestSupporting.category;
                        currentTyp = latestSupporting.typ;
                    } else {
                        if (latestTmpData != null) {
                            if (latestTmpData.last_updated_time < latestSupporting.last_updated_time) {
                                latestTmpData = latestSupporting;
                                currentCategory = latestSupporting.category;
                                currentTyp = latestSupporting.typ;
                            }
                        } else {
                            latestTmpData = latestSupporting;
                            currentCategory = latestSupporting.category;
                            currentTyp = latestSupporting.typ;
                        }
                    }
                }
                if (tmp2.length > 0) {
                    latestIdle = this.$store.getters.getWork(tmp2[0]);
                    if (latestIdle.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS ||
                        latestIdle.state == window.CONSTANTS.WORK_STATE.STOP) {
                        currentCategory = latestIdle.category;
                        currentTyp = latestIdle.typ;
                    } else {
                        if (latestTmpData != null) {
                            if (latestTmpData.last_updated_time < latestIdle.last_updated_time) {
                                latestTmpData = latestIdle;
                                currentCategory = latestIdle.category;
                                currentTyp = latestIdle.typ;
                            }
                        } else {
                            latestTmpData = latestIdle;
                            currentCategory = latestIdle.category;
                            currentTyp = latestIdle.typ;
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
                        [blast.x_loc, blast.y_loc + 0.4], {
                            id: blast.id,  // TODO:
                            symbol: {
                                'markerFile': fileUrl,
                                'markerWidth': {stops: [[4, 20], [5, 30], [6, 50], [7, 80]]},
                                'markerHeight': {stops: [[4, 20], [5, 30], [6, 50], [7, 80]]},
                                'markerDy': {stops:[[4, 10], [5, 20], [6, 30], [7, 40]]}
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
                            if (tmp !== undefined && tmp.length > 0) {
                                // View the Current Work information

                                this.services.getWorkDataByWork({"work_id": tmp[0]}, (resData) => {
                                    console.log("Success to get work Data list", resData);
                                    this.workOperatorIdList = [];
                                    this.workEquipmentIdList = [];

                                    this._.forEach(resData.operator, workOperator => {
                                        this.workOperatorList.push(workOperator);
                                    });
                                    this._.forEach(resData.equipment, workEquipment => {
                                        this.workEquipmentList.push(workEquipment);
                                    });
                                    this.setCurrentWorkId(tmp[0]);
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
        closeAddWindow() {
            if (this.addWindowItem !== null) {
                this.addWindowItem.remove();
                this.addWindowItem = null;
            }
            this.map.closeMenu();
        },
        closeWindow() {
            if (this.windowItem !== null) {
                this.windowItem.hide();
                this.windowItem = null;
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
        setContextMenu(marker) {
            marker.on('contextmenu', () => {
                this.closeInfoWindow();
                this.closeWindow();
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
            var coordinate = this.map.getCenter();

            var options = {
                    //'autoOpenOn' : 'click',  //set to null if not to open window when clicking on map
                    'single' : true,
                    'custom' : true,
                    'autoCloseOn': true,
                    'autoOpenOn': false,
                    'dx' : -3,
                    'dy' : -12,
                    'content'   : '<div class="content">' +
                        '<div class="row">' +
                            '<div class="column">' +
                                '<div class="pop_title">Jumbo Drill</div>' +
                                '<div class="sub-row">' +
                                    '<div class="item">' + "JD-01" + '</div>' +
                                    '<div class="item">' + "JD-02" + '</div>' +
                                    '<div class="item">' + "JD-03" + '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="column">' +
                                '<div class="pop_title">LOADER</div>' +
                                '<div class="sub-row">' +
                                    '<div class="item">' + "WL-01" + '</div>' +
                                    '<div class="item">' + "WL-02" + '</div>' +
                                    '<div class="item">' + "WL-03" + '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="column">' +
                                '<div class="pop_title">Shortcrete</div>' +
                                '<div class="sub-row">' +
                                    '<div class="item">' + "SC-01" + '</div>' +
                                    '<div class="item">' + "SC-02" + '</div>' +
                                    '<div class="item">' + "SC-03" + '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                };
            var infoWindow = new maptalks.ui.InfoWindow(options);
            console.log(coordinate)
            infoWindow.addTo(this.map).show({x: coordinate.x + 20, y: coordinate.y + 10});
            this.windowItem = infoWindow;
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
                    this._showWindow();
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
                updateWorkOperatorList: (data) => {
                    this._handleUpdateWorkOperatorList(data);
                },
                updateWorkEquipmentList: (data) => {
                    this._handleUpdateWorkEquipmentList(data);
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
                        this._drawTunnel(item);
                    }
                    this.$store.commit('addTunnel', item);
                } else if (data.kind === 'remove') {
                    let tunnel = this.$store.getters.getTunnel(item),
                        typ = window.CONSTANTS.TUNNEL_TYPE.CAVERN;
                    if (tunnel !== null || tunnel !== undefined) {
                        let tunnelMarker = this.tunnelMarkers[typ][item];
                        tunnelMarker.remove();
                        delete this.tunnelMarkers[typ][item];
                        this.$store.commit('removeTunnel', item);
                    }
                } else if (data.kind === 'update') {
                    let tunnel = this.$store.getters.getTunnel(item.id);
                    // this._fixDrawTunnel(item);
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
                        this._drawBlast(item);
                    }
                    this.$store.commit('addBlast', item);
                } else if (data.kind === 'remove') {
                    var _marker = this.blastLayer.getGeometryById(item)
                    _marker.remove();
                    this.$store.commit('removeBlast', item);
                } else if (data.kind === 'update') {
                    this.$store.commit('updateBlast', item);
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
                    this.$store.commit('updateBlast', item);
                }
            });
        },
        _handleUpdateWorkList(data) {
            const list = data.v;
            this._.forEach(list, item => {
                // TODO:
                if (data.kind === 'add') {
                    this.$store.commit('addWork', item);
                    if (!(item.id in this.pauseIdWithWork)) {
                        this.pauseIdWithWork[item.id] = [];
                    }
                } else if (data.kind === 'remove') {
                    this.$store.commit('removeWork', item)
                    if (item.id in this.pauseIdWithWork) {
                        delete this.pauseIdWithWork[item];
                    }
                } else if (data.kind === 'update') {
                    this.$store.commit('updateWork', item);
                    if (item.state == 1) {
                        let blast = this.$store.getters.getBlast(item.blast_id);
                        var _marker = this.workLayer.getGeometryById(blast.id);
                        this.workLayer.removeGeometry([_marker]);
                        this.drawWork(blast);
                    }
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
                } else if (data.kind === 'update') {
                }
            });
        },
        _handleUpdateWorkOperatorList(data) {
            const list = data.v;
            this._.forEach(list, item => {
                if (data.kind === 'add') {
                    this.$store.commit('addOperator', item);
                    if (this.workOperatorList.indexOf(item.id) < 0) {
                        this.workOperatorList.push(item);
                    }
                } else if (data.kind === 'remove') {
                } else if (data.kind === 'update') {
                }
            });
        },
        _handleUpdateWorkEquipmentList(data) {
            const list = data.v;
            this._.forEach(list, item => {
                if (data.kind === 'add') {
                    this.$store.commit('addEquipment', item);
                    if (this.workEquipmentList.indexOf(item.id) < 0) {
                        this.workEquipmentList.push(item);
                    }
                } else if (data.kind === 'remove') {
                } else if (data.kind === 'update') {
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

</style>