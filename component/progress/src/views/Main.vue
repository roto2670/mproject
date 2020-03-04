<template>
    <div id="main" class="main-container">
        <Top :selectedType="isTopPressedType" @select-top-button="handleTopButton"></Top>
        <AddTunnel :type="getCurrentType()"
            @change-tunnel-direction="handleAddTunnelDirection"
            @select-ok-button="handleAddTunnelOkButton"
            @select-cancel-button="handleAddTunnelCancelButton"></AddTunnel>
        <TunnelInfo :type="getCurrentType()" :id="currentTunnelId"
            @select-ok-button="handleTunnelInfoOkButton"
            @select-cancel-button="handleTunnelInfoCancelButton"
            @select-add-progress-button="handleAddProgress"
            @select-remove-tunnel-button="handleRemoveTunnel"></TunnelInfo>
        <AddProgress :type="getCurrentType()"
            @select-ok-button="handleAddProgressOkButton"
            @select-cancel-button="handleAddProgressCancelButton"></AddProgress>
        <!-- <ProgressInfo v-if="isTunnelInfoType()" :type="currentTunnelType" :id="currentTunnelId"
            @select-ok-button="handleProgressInfoOkButton"
            @select-cancel-button="handleProgressInfoCancelButton"
            @select-add-progress-button="handleAddProgress"></ProgressInfo> -->
        <div :id="id" class="map-container">
        </div>
    </div>
</template>
<script>
import * as maptalks from 'maptalks';
import Top from '@/components/Top';
import AddTunnel from '@/components/AddTunnel';
import AddProgress from '@/components/AddProgress';
import TunnelInfo from '@/components/TunnelInfo';
import ProgressInfo from '@/components/ProgressInfo';
export default {
    name: 'Main',
    components: {
        Top,
        AddTunnel,
        AddProgress,
        TunnelInfo,
        ProgressInfo
    },
    data() {
        return {
            id: 'map',
            info: {},
            map: null,
            tunnelLayers: {},
            progressLayers: {},
            workLayers: {},
            zoomLevel: 0,
            tunnelMarkers: {},
            progressMarkers: {},
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
            progIDList: [],
            workIDList: [],
            //
            currentType: null,
            currentTunnelId: null,
            currentTunnelType: null,
            currentMarker: null,
            //
            progressLayer: null,
            workLayer: null,
            workColor: {
                '0': '#ffffff',
                'a': '#ff0000',
                'b': '#00ff00',
                'c': '#0000ff'
            },
            colorMap: {
                'selected': '#dddddd',
                '0': '#999999',
                '1': '#00aabb'
            },
            mockData: [
                {'id': 160, 'x_loc': 69.3, 'y_loc': 54.24, 'width': 1132, 'height': 18, 'status': 'c',  // 캐번 height
                 'name': 'progress10', 'current': '815m'},
                {'id': 370, 'x_loc': 69.3, 'y_loc': 39.5, 'width': 1200, 'height': 6, 'status': 'b',   // 워터갤러리 height
                 'name': 'progress10', 'current': '815m'},
                {'id': 161, 'x_loc': 65.5, 'y_loc': 51.24, 'width': 150, 'height': 18, 'status': 'c',  // 캐번 height
                 'name': 'progress10', 'current': '815m'},
                {'id': 162, 'x_loc': 65.5, 'y_loc': 45.12, 'width': 150, 'height': 6, 'status': 'b',   // 워터갤러리 height
                 'name': 'progress10', 'current': '815m'},
                {'id': 163, 'x_loc': 61.0, 'y_loc': 42.38, 'width': 60, 'height': 10, 'status': 'a',
                 'name': 'progress10', 'current': '815m'},
                // {'id': 1700, 'x_loc': 64.4, 'y_loc': 54.2, 'width': 8, 'height': 92, 'status': 'a',  // 캐번 height
                //  'name': 'progress10', 'current': '815m'},
                {'id': 1700, 'x_loc': 64.4, 'y_loc': 55.6, 'width': 8, 'height': 36, 'status': 'a',  // 캐번 height
                 'name': 'progress10', 'current': '815m'},
                // {'id': 161, 'x': 65.5, 'y': 51.24317965522793, 'width': 150, 'height': 18, 'status': 'c',  // 캐번 height
                //  'name': 'progress10', 'current': '815m'},
                // {'id': 162, 'x': 65.5, 'y': 45.12317965522793, 'width': 150, 'height': 6, 'status': 'b',   // 워터갤러리 height
                //  'name': 'progress10', 'current': '815m'},
                // {'id': 163, 'x': 61.4, 'y': 42.38217965522793, 'width': 60, 'height': 10, 'status': 'a',
                //  'name': 'progress10', 'current': '815m'},
            ]
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
                        this.tunnelMarkers[value] = {}
                    });
                    this._getTunnelList();
                    this.progressLayer = new maptalks.VectorLayer('vector').addTo(this.map);
                    this.progressLayer.setZIndex(2);
                    this.workLayer = new maptalks.VectorLayer('vector1').addTo(this.map);
                    this.workLayer.setZIndex(3);
                    this.drawProgressList();
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
        getUUID() {
          return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 3 | 8);
            return v.toString(16);
          });
        },
        _getTunnelList() {
             this.services.getTunnels(tunnels => {
                 console.log("Success to get tunnels", tunnels);
                 this._.forEach(tunnels, tunnel => {
                    this.tunnelIDList.push(tunnel.id)
                    this._drawTunnel(tunnel);
                    this.$store.commit('addTunnel', tunnel);
                 });
                 this._getProgressList();
             }, (error) => {
                 console.log("Failed to get tunnel list.", error);
             });
        },
        _getProgressList() {
             const data = {};
             data.id_list = this.tunnelIDList;
             this.services.getProgress(data, (resData) => {
                 console.log("Success to get progress");
                 this._drawProgressList(resData)
             }, (error) => {
                 console.log("Failed to get progress list.");
             });
        },
        _drawTunnel(tunnel){
            const xPosition = tunnel.x_loc,
                  yPosition = tunnel.y_loc,
                  width = tunnel.width,
                  height = tunnel.height;
            var marker = new maptalks.TextBox("", [xPosition, yPosition],
                                              {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                                              {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}, {
                id: tunnel.id,
                editable: false,
                draggable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 0,
                    markerFill: this.colorMap[tunnel.typ],
                    markerFillOpacity: 0.6
                },
                symbol: {
                    textMaxWidth: {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                    textMaxHeight: {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}
                }
            });
            marker.defaultWidth = width;
            marker.defaultHeight = height;
            marker.markerType = tunnel.typ;
            this.tunnelLayers[tunnel.typ].addGeometry([marker]);
            this.tunnelMarkers[tunnel.typ][tunnel.id] = marker;
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
        setCurrentType(typ) {
            this.currentType = typ;
        },
        getCurrentType() {
            return this.currentType;
        },
        clearCurrentType() {
            this.currentType = null;
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
        clearAll() {
            this.clearCurrentType();
            this.clearCurrentMarker();
            this.clearCurrentTunnelId();
            this.clearTunnelType();
        },
        initContextMenu() {
            this.contextMenuOption = {
                'custom': true,
                'items': `<div class="custom_menu">
                <div class="additem">
                    <div id="cavernItem">ADD CAVERN</div>
                    <div id="waterCurtainItem">ADD WATER CURTAIN</div>
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
                    this.handleAddCavern(e.coordinate.x, e.coordinate.y);
                }

                document.getElementById('waterCurtainItem').onclick = () => {
                    this.map.closeMenu();
                    this.handleAddWaterCurtain(e.coordinate.x, e.coordinate.y);
                }
            });
        },
        handleAddTunnelDirection(value) {
            let width = 0,
                height = 0;
            if (value === 0 || value === 1) {
                // row
                if (this.currentTunnelType === window.CONSTANTS.TUNNEL_TYPE.CAVERN) {
                    width = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH;
                    height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.HEIGHT;
                } else {
                    width = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.WATER_CURTAIN_ROW.WIDTH;
                    height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.WATER_CURTAIN_ROW.HEIGHT;
                }
            } else {
                // column
                if (this.currentTunnelType === window.CONSTANTS.TUNNEL_TYPE.CAVERN) {
                    width = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_COLUMN.WIDTH;
                    height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_COLUMN.HEIGHT;
                } else {
                    width = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.WATER_CURTAIN_COLUMN.WIDTH;
                    height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.WATER_CURTAIN_COLUMN.HEIGHT;
                }
            }
            this.currentMarker.defaultWidth = width;
            this.currentMarker.defaultHeight = height;
            this.currentMarker.setWidth({stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]});
            this.currentMarker.setHeight({stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]});
        },
        handleAddTunnelOkButton(value) {
            const data = {}
            data.id = this.currentMarker.getId();
            data.name = value.tunnelId;
            data.typ = this.currentTunnelType;
            data.x_loc = this.currentMarker.getCoordinates().x;
            data.y_loc = this.currentMarker.getCoordinates().y;
            data.height = this.currentMarker.defaultHeight;
            data.width = this.currentMarker.defaultWidth;
            data.prog_dir = value.tunnelDirection;
            console.log("### data : ", data);
            this.currentMarker.remove();
            this.services.addTunnel(data, (resData) => {
                console.log("success to add tunnel");
                this.clearAll();
            }, (error) => {
                console.log("fail to add tunnel : ", error)
            });
        },
        handleAddTunnelCancelButton() {
            this.tunnelLayers[this.currentTunnelType].removeGeometry([this.currentMarker])
            this.clearAll();
        },
        _handleTunnelClickEvent(marker) {
            marker.on('click', (e) => {
                if (this.currentMarker !== null) {
                    this.currentMarker.updateSymbol({
                            markerLineColor: '#000000',
                            markerLineWidth: 0,
                            markerFill: this.colorMap[this.currentMarker.markerType],
                            markerOpacity: 0.6
                    });
                    this.clearAll();
                }
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
                    if (e.target.markerType == window.CONSTANTS.TUNNEL_TYPE.CAVERN) {
                        this.setCurrentType(window.CONSTANTS.TYPE.SELECT_CAVERN);
                    } else {
                        this.setCurrentType(window.CONSTANTS.TYPE.SELECT_WATER_CURTAIN);
                    }
                    e.domEvent.stopPropagation();
                }
            });
        },
        handleAddCavern(xPosition, yPosition) {
            this.setCurrentType(window.CONSTANTS.TYPE.ADD_TUNNEL);
            this.setTunnelType(window.CONSTANTS.TUNNEL_TYPE.CAVERN);
            var width = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.WIDTH,
                height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.CAVERN_ROW.HEIGHT,
                marker = new maptalks.TextBox("", [xPosition, yPosition],
                                              {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                                              {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}, {
                id: this.getUUID(),
                editable: false,
                draggable: true,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.colorMap[window.CONSTANTS.TUNNEL_TYPE.CAVERN],
                    markerFillOpacity: 0.3
                },
                symbol: {
                    textMaxWidth: {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                    textMaxHeight: {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}
                }
            });
            marker.defaultWidth = width;
            marker.defaultHeight = height;
            marker.markerType = window.CONSTANTS.TUNNEL_TYPE.CAVERN;
            this.tunnelLayers[window.CONSTANTS.TUNNEL_TYPE.CAVERN].addGeometry([marker]);
            marker.on('dragend', (e) => {
                e.domEvent.stopPropagation();
                this.closeMenu();
            })
            this.setCurrentMarker(marker);
        },
        handleAddWaterCurtain(xPosition, yPosition) {
            this.setCurrentType(window.CONSTANTS.TYPE.ADD_TUNNEL);
            this.setTunnelType(window.CONSTANTS.TUNNEL_TYPE.WATER_CURTAIN);
            var width = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.WATER_CURTAIN_ROW.WIDTH,
                height = window.CONSTANTS.TUNNEL_DEFAULT_SIZE.WATER_CURTAIN_ROW.HEIGHT,
                marker = new maptalks.TextBox("", [xPosition, yPosition],
                                              {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                                              {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}, {
                id: this.getUUID(),
                editable: false,
                draggable: true,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.colorMap[window.CONSTANTS.TUNNEL_TYPE.WATER_CURTAIN],
                    markerFillOpacity: 0.3
                },
                symbol: {
                    textMaxWidth: {stops: [[4, width], [5, width * 2], [6, width * 4], [7, width * 8]]},
                    textMaxHeight: {stops: [[4, height], [5, height * 2], [6, height * 4], [7, height * 8]]}
                }
            });
            marker.defaultWidth = width;
            marker.defaultHeight = height;
            marker.markerType = window.CONSTANTS.TUNNEL_TYPE.WATER_CURTAIN;
            this.tunnelLayers[window.CONSTANTS.TUNNEL_TYPE.WATER_CURTAIN].addGeometry([marker]);
            marker.on('dragend', (e) => {
                e.domEvent.stopPropagation();
                this.closeMenu();
            })
            this.setCurrentMarker(marker);
        },
        handleUpdateTunnel() {
            if (this.currentMarker != null) {

            }
        },
        handleTunnelInfoOkButton(data) {
            this.currentMarker.updateSymbol({
                markerLineWidth: 0,
                markerFill: this.colorMap[this.currentTunnelType],
                markerFillOpacity: 0.6
            });
            this.services.updateTunnel(data, (resData) => {
                console.log("success to update tunnel")
                this.clearAll();
            }, (error) => {
                console.log("fail to update tunnel : ", error)
            });
        },
        handleTunnelInfoCancelButton() {
            this.currentMarker.updateSymbol({
                markerLineWidth: 0,
                markerFill: this.colorMap[this.currentTunnelType],
                markerFillOpacity: 0.6,
            });
            this.clearAll();
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
        handleAddProgress(tunnelId, tunnelType) {
            const tunnelData = this.$store.getters.getTunnel(tunnelId),
                  data = {};

            // TODO: x, y get change?(tunnel model instead tunnel marker)
            let tunnelMarker = this.tunnelMarkers[tunnelType][tunnelId],
                xPosition = tunnelMarker.getCoordinates().x,
                yPosition = tunnelMarker.getCoordinates().y;

            if (tunnelData.prog_dir == window.CONSTANTS.PROG_DIR.RIGHT) {
                var x1 = (xPosition - ((tunnelMarker.defaultWidth / 2) / 11.25)),
                    progressWidth = tunnelMarker.defaultWidth,
                    progressHeight = tunnelMarker.defaultHeight;
            } else if (tunnelData.prog_dir == window.CONSTANTS.PROG_DIR.LEFT) {
                var x1 = (xPosition + ((tunnelMarker.defaultWidth / 2) / 11.25)),
                    progressWidth = tunnelMarker.defaultWidth,
                    progressHeight = tunnelMarker.defaultHeight;
            } else if (tunnelData.prog_dir == window.CONSTANTS.PROG_DIR.UP) {
                // TODO:
            } else if (tunnelData.prog_dir == window.CONSTANTS.PROG_DIR.DOWN) {
                // TODO:
            }

            var marker1 = new maptalks.TextBox("", [x1 - ((10 / 2) / 11.25), yPosition],
                                              {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]},
                                              {stops: [[4, progressHeight], [5, progressHeight * 2], [6, progressHeight * 4], [7, progressHeight * 8]]}, {
                id: this.getUUID(),
                editable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.workColor['a'],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]},
                    textMaxHeight: {stops: [[4, progressHeight], [5, progressHeight * 2], [6, progressHeight * 4], [7, progressHeight * 8]]}
                }
            });

            data.id = this.getUUID();
            data.name = "test_" + data.id;
            data.tunnel_id = tunnelData.id;
            data.x_loc = x1
            data.y_loc = yPosition
            data.height = progressHeight
            data.width = ((tunnelMarker.defaultWidth / 2) / 11.25)
            this.services.addProgress(data, (resData) => {
                console.log("success to add Progress")
            }, (error) => {
                console.log("fail to add Progress : ", error)
            });
        },
        handleAddProgressOkButton() {
            this.currentMarker.updateSymbol({
                    markerLineWidth: 0,
            });
            this.progressMarkers[this.currentMarker.getId()] = this.currentMarker;
            this.setContextMenu(this.currentMarker);
            this.setProgressInfoWindow(this.currentMarker);
            this.clearAll();
        },
        handleAddProgressCancelButton() {
            this.clearAll();
        },
        handleProgressInfoOkButton() {
        },
        handleProgressInfoCancelButton() {
        },
        handleAddWork(progressId, progressType) {
        },
        drawProgressList() {
            this._.forEach(this.mockData, (progress) => {
                this.drawProgress(progress);
            });
        },
        _drawProgressList(progressGetData) {
            this._.forEach(progressGetData, (progressList) => {
                this._.forEach(progressList, (progressData) => {
                    this._drawProgress(progressData);
                });
            });
        },
        drawProgress(progress) {
            var marker = new maptalks.TextBox("", [progress.x_loc, progress.y_loc],
                                              {stops: [[4, progress.width], [5, progress.width * 2], [6, progress.width * 4], [7, progress.width * 8]]},
                                              {stops: [[4, progress.height], [5, progress.height * 2], [6, progress.height * 4], [7, progress.height * 8]]}, {
                id: progress.id,
                editable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.workColor[progress.status],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, progress.width], [5, progress.width * 2], [6, progress.width * 4], [7, progress.width * 8]]},
                    textMaxHeight: {stops: [[4, progress.height], [5, progress.height * 2], [6, progress.height * 4], [7, progress.height * 8]]}
                }
            });
            this.setContextMenu(marker);
            this.setProgressInfoWindow(marker);
            this.progressLayer.addGeometry(marker);
            this.$store.commit('addProgress', progress);
            // this.drawWork(progress);


            // console.log("### progress x : " + (progress.x));
            // console.log("### progress width : " + (progress.width));
            // console.log("### progress width cal : " + ((progress.width / 2) / 11.25));
            // console.log("### progress width ret : " + (progress.x_loc - ((progress.width / 2) / 11.25)));

            var x1 = (progress.x_loc + ((progress.width / 2) / 11.25));
            var marker1 = new maptalks.TextBox("", [x1 - ((10 / 2) / 11.25), progress.y_loc],
                                              {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]},
                                              {stops: [[4, progress.height], [5, progress.height * 2], [6, progress.height * 4], [7, progress.height * 8]]}, {
                id: progress.id + 10,
                editable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 0,
                    markerFill: this.workColor['0'],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]},
                    textMaxHeight: {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]}
                }
            });
            this.progressLayer.addGeometry(marker1);
            var x2 = (progress.x_loc - ((progress.width / 2) / 11.25));
            var marker2 = new maptalks.TextBox("", [x2 + ((10 / 2) / 11.25), progress.y_loc],
                                              {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]},
                                              {stops: [[4, progress.height], [5, progress.height * 2], [6, progress.height * 4], [7, progress.height * 8]]}, {
                id: progress.id + 100,
                editable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 0,
                    markerFill: this.workColor['0'],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]},
                    textMaxHeight: {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]}
                }
            });
            this.progressLayer.addGeometry(marker2);
        },
        _drawProgress(progress) {
            const tunnelData = this.$store.getters.getTunnel(progress.tunnel_id);
            let tunnelMarker = this.tunnelMarkers[tunnelData.typ][progress.tunnel_id],
                xPosition = tunnelMarker.getCoordinates().x,
                yPosition = tunnelMarker.getCoordinates().y;

            if (tunnelData.prog_dir == window.CONSTANTS.PROG_DIR.RIGHT) {
                var x1 = (xPosition - ((tunnelMarker.defaultWidth / 2) / 11.25)),
                    progressWidth = tunnelMarker.defaultWidth,
                    progressHeight = tunnelMarker.defaultHeight;
            } else if (tunnelData.prog_dir == window.CONSTANTS.PROG_DIR.LEFT) {
                var x1 = (xPosition + ((tunnelMarker.defaultWidth / 2) / 11.25)),
                    progressWidth = tunnelMarker.defaultWidth,
                    progressHeight = tunnelMarker.defaultHeight;
            } else if (tunnelData.prog_dir == window.CONSTANTS.PROG_DIR.UP) {

            } else if (tunnelData.prog_dir == window.CONSTANTS.PROG_DIR.DOWN) {

            }

            var marker1 = new maptalks.TextBox("", [x1 - ((10 / 2) / 11.25), yPosition],
                                              {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]},
                                              {stops: [[4, progressHeight], [5, progressHeight * 2], [6, progressHeight * 4], [7, progressHeight * 8]]}, {
                id: progress.id,
                editable: false,
                boxSymbol: {
                    markerType: 'square',
                    markerLineColor: '#000000',
                    markerLineWidth: 1,
                    markerFill: this.workColor['a'],
                    markerFillOpacity: 1
                },
                symbol: {
                    textMaxWidth: {stops: [[4, 10], [5, 10 * 2], [6, 10 * 4], [7, 10 * 8]]},
                    textMaxHeight: {stops: [[4, progressHeight], [5, progressHeight * 2], [6, progressHeight * 4], [7, progressHeight * 8]]}
                }
            });
            this.setContextMenu(marker1);
            this.setProgressInfoWindow(marker1);
            this.$store.commit('addProgress', progress);
            this.progressLayer.addGeometry(marker1);
        },
        drawWorkList() {

        },
        drawWork(progress, work) {
            let fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-pa-round.svg`;  // TODO:
            if (progress.status === "a") {
                fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }drill.svg`;  // TODO:
            } else if (progress.status === "b") {
                fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }blast.svg`;  // TODO:
            } else if (progress.status === "c") {
                fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }concrete.svg`;  // TODO:
            }
            let marker = new maptalks.Marker(
                [progress.x_loc, progress.y_loc], {
                    id: progress.id,  // TODO:
                    symbol: {
                        'markerFile': fileUrl,
                        'markerWidth': {stops: [[4, 20], [5, 30], [6, 50], [7, 80]]},
                        'markerHeight': {stops: [[4, 20], [5, 30], [6, 50], [7, 80]]},
                        'markerDy': {stops:[[4, 10], [5, 20], [6, 30], [7, 40]]}
                    }
                }
            )
            this.workLayer.addGeometry(marker);
            this.setWorkInfoWindow(marker, progress.status);
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
        setProgressInfoWindow(marker) {
            marker.on('click', (e) => {
                marker.updateSymbol({
                    lineColor: '#000000',
                    lineWidth: 1,
                    polygonFill: '#929292',
                    polygonOpacity: 1
                });
                console.log("### marker: ", marker);
                e.domEvent.stopPropagation();
                this.closeMenu();
                console.log("#### clieck.", e.target.getId());
                let info = this.$store.getters.getProgress(marker.getId()),
                    currentTime = new Date().toDateString(),
                    name = "a",
                    current = "b",
                    currentWork = "Ready";
                if (info !== undefined) {
                    console.log("##3 hi");
                    name = info.name;
                    current = info.current;
                    if (info.status === "a") {
                        currentWork = "Drilling";
                    } else if (info.status === "b") {
                        currentWork = "Blasting";
                    } else if (info.status === "c") {
                        currentWork = "Concreting";
                    }
                }
                marker.setInfoWindow({ // TODO: vue component
                    content: `<div class="progress-info">
                    <div class="progress-info-header">
                        <div class="progress-info-header-left">${ marker.getId() }</div><div class="progress-info-header-right">Edit</div>
                    </div>
                    <div class="progress-info-body">
                        <div class="progress-info-body-row">
                            <div class="progress-info-body-row-left">Name</div><div class="progress-info-body-row-right">${ name }</div>
                        </div>
                        <div class="progress-info-body-row">
                            <div class="progress-info-body-row-left">Current</div><div class="progress-info-body-row-right">${ current }</div>
                        </div>
                        <div class="progress-info-body-row">
                            <div class="progress-info-body-row-left">Time</div><div class="progress-info-body-row-right">${ currentTime }</div>
                        </div>
                        <div class="progress-info-body-row">
                            <div class="progress-info-body-row-left">Current Work</div><div class="progress-info-body-row-right">${ currentWork }</div>
                        </div>
                    </div>
                                </div>`,
                    width: 350,
                    custom: true,
                    autoPan: false,
                    animation: 'fade',
                    dy: -10
                });
                marker.closeInfoWindow();
                marker.openInfoWindow();
                this.infoWindowItem = marker;
            });
        },
        setWorkInfoWindow(marker, status) {
            let title = "Ready";
            if (status === "a") {
                title = "Drill";
            } else if (status === "b") {
                title = "Blast";
            } else if (status === "c") {
                title = "Concrete";
            }
            marker.on('click', (e) => {
                e.domEvent.stopPropagation();
                this.closeMenu();
                marker.setInfoWindow({
                    custom: true,
                    content: `<div class="add-work-container">
                    <div class="add-work-header">
                        <div class="add-work-header-text">${ title }</div>
                    </div>
                    <div class="add-work-body">
                        <div class="add-work-body-row-container">
                        POINT : AT2-WTH
                        </div>
                        <div class="add-work-body-row-container">
                        EQUIP : JD-01
                        </div>
                        <div class="add-work-body-row-container">
                        Startd : 00:22
                        </div>
                        <div class="add-work-body-row-container">
                        Stop : 01:22
                        </div>
                        <div class="add-work-body-row-container">
                        Total : 01:00
                        </div>
                        <div class="add-work-body-button-container">
                            <div class="add-work-body-start-button">Start</div><div class="add-work-body-stop-button">Stop</div><div class="add-work-body-finish-button">Finish</div>
                        </div>
                    </div>
                            </div>`,
                    // dx: -75,
                    animation: 'fade',
                    autoPan: false,
                    dy: -10
                });
                marker.closeInfoWindow();
                marker.openInfoWindow();
                this.infoWindowItem = marker;
            });
        },
        addWork(marker) {
            var options = {
                'custom': true,
                'content': `<div class="add-work-container">
                <div class="add-work-header">
                    <div class="add-work-header-text">DRILLING</div>
                </div>
                <div class="add-work-body">
                    <div class="add-work-body-row-container">
                    POINT : <input type='text'></input>
                    </div>
                    <div class="add-work-body-row-container">
                    EQUIP : <select>
                                <option value="jd-01">JD-01</option>
                                <option value="dt-05">DT-05</option>
                                <option value="sc-01">SC-01</option>
                            </select>
                    </div>
                    <div class="add-work-body-button-container">
                        <div>OK</div>
                    </div>
                </div>
                          </div>`,
                dx: -75,
                animation: 'fade'
            };
            var addWorkWindow = new maptalks.ui.InfoWindow(options);
            addWorkWindow.addTo(this.map).show();
            this.addWindowItem = addWorkWindow;
        },
        setContextMenu(marker) {
            marker.on('contextmenu', () => {
                this.closeInfoWindow();
                this.closeWindow();
                this._setContextMenu(marker);
                document.getElementById('add-button').onclick = () => {
                    this.closeMenu();
                    this.addWork(marker);
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
                    this.services.removeProgress(data, (resData) => {
                        marker.remove();
                        this.$store.commit('removeProgress', marker._id);
                        console.log("Success to remove progress")
                    }, (error) => {
                        console.log("Failed to remove progress")
                    });
                }
            });
        },
        _setContextMenu(marker) {
            let text = "Edit";
            if (marker.isEdit) {
               text = "Finish";
            }
            marker.setMenu({
                items: `<div class="context-menu-container ">
                <div class="context-menu-top-panel"><div class="context-menu-text-wrapper">
                    <div class="context-menu-type-text">Progress</div>
                    <div class="context-menu-name-text"></div>
                </div></div>
                <div class="context-menu-bottom-panel">
                    <div id="add-button" class="context-menu-button-frame"><div class="context-menu-button-panel">
                    <div id="add-button-text" class="context-menu-button-text">Add Work</div>
                    </div></div>
                    <div id="edit-button" class="context-menu-button-frame"><div class="context-menu-button-panel">
                    <div id="move-button-text" class="context-menu-button-text">${text}</div>
                    </div></div>
                    <div id="remove-button" class="context-menu-button-frame"><div class="context-menu-button-panel">
                    <div id="remove-button-text" class="context-menu-button-text">Remove</div>
                    </div></div>
                </div>
                        </div>`,
                width: 350,
                custom: true,
                dx: 10,
                dy: 10,
                animation: 'fade',
            })
            marker.openMenu();
            this.contextMenuItem = marker;
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
                updateTunnelList: (data) => {
                    this._handleUpdateTunnelList(data);
                },
                updateProgressList: (data) => {
                    this._handleUpdateProgressList(data);
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
                    let tunnel = this.$store.getters.getTunnel(item);
                    if (tunnel !== null || tunnel !== undefined) {
                        let tunnelMarker = this.tunnelMarkers[tunnel.typ][item];
                        tunnelMarker.remove();
                        delete this.tunnelMarkers[tunnel.typ][item];
                        this.$store.commit('removeTunnel', item);
                    }
                } else if (data.kind === 'update') {
                    let tunnel = this.$store.getters.getTunnel(item.id);
                    this._fixDrawTunnel(item);
                    this.$store.commit('updateTunnel', item);
                }
            });
        },
        _handleUpdateProgressList(data){
            const list = data.v;
            this._.forEach(list, item => {
                if (data.kind === 'add') {
                    let progress = this.$store.getters.getProgress(item.id);
                    if (progress === null || progress === undefined) {
                        this._drawProgress(item);
                    }
                    this.$store.commit('addProgress', item);
                } else if (data.kind === 'remove') {
                    var _marker = this.progressLayer.getGeometryById(item)
                    _marker.remove();
                    this.$store.commit('removeProgress', item.id);
                } else if (data.kind === 'update') {
                    console.log("update progress part")
                }
            });
        }
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

.context-menu-container {
    width: 180px;
    height: auto;
    border-radius: 15px;
    color: white;
    overflow: hidden;
    box-shadow: 10px 10px 25px rgba(40, 40, 40, 0.3);
}

.context-menu-container {
    background-color: rgb(40, 160, 200);
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

.context-menu-button-frame {
    background-color: rgb(60, 175, 200);
    border-top: thin solid rgb(40, 160, 200);
}

.context-menu-button-frame:active {
    background: #248ea5;
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
.progress-info {
    width: 400px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 11px 11px 20px #aaaaaa99;
    background-color: #999999;
}
.progress-info-header {
    width: 400px;
    height: 40px;
    color: #ffffff;
    font-size: x-large;
    background-color: #09b8e6;
}
.progress-info-header-left {
    text-align: center;
    vertical-align: middle;
    background-color: #09b8e6;
    width: 300px;
    height: 40px;
    display: inline-block;
    padding-top: 8px;
}
.progress-info-header-right {
    text-align: center;
    vertical-align: middle;
    background-color: #09b8e6;
    width: 100px;
    height: 40px;
    display: inline-block;
    padding-top: 8px;
}

.progress-info-body {
    width: 400px;
    height: 100%;
    background-color: #ffffff;
}
.progress-info-body-row {
    color: #999999;
    border-top : 1px solid #999999;
    line-height: 2;
}
.progress-info-body-row-left {
    width: 150px;
    height: 34px;
    display: inline-block;
    padding-left: 8px;
    border-right: 1px solid #999999;
}
.progress-info-body-row-right {
    width: 250px;
    height: 34px;
    display: inline-block;
    padding-left: 8px;
}

.add-work-container {
    width: 300px;
    background-color: rgb(138 221 58);
    border-radius: 10px;
    box-shadow: 11px 11px 20px #aaaaaa99;
}

.add-work-header {
    width: 100%;
    height: 30px;
    background-color: rgb(138 221 58);
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
}
.add-work-header-icon {
    width: 100px;
    height: 30px;
    display: inline-block;
}
.add-work-header-text {
    width: 200px;
    height: 30px;
    text-align: right;
    color: #ffffff;
    font-size: x-large;
    display: inline-block;
    padding-right: 8px;
}
.add-work-body {
    width: 100%;
    background-color: #ffffff;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
}
.add-work-body-row-container {
    color: #999999;
    padding-left: 6px;
    line-height: 1.6;
}
.add-work-body-work-container {
    width: 100%;
    height: 130px;
}
.add-work-body-button-container {
    width: 100%;
    height: 40px;
    text-align: center;
    background: #eeeeee;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    padding-top: 10px;
    font-weight: bold;

}
.add-work-body-button {
    width: 33%;
    height: 40px;
    display: inline-block;
    text-align: center;
}
.add-work-body-start-button {
    width: 33%;
    height: 40px;
    display: inline-block;
    text-align: center;
    background: #eeeeee;
    padding-top: 10px;
    border-bottom-left-radius: 10px;
    font-weight: bold;
}
.add-work-body-stop-button {
    width: 34%;
    height: 40px;
    border-left: 1px solid #ffffff;
    border-right: 1px solid #ffffff;
    display: inline-block;
    text-align: center;
    background: #eeeeee;
    padding-top: 10px;
    font-weight: bold;
}
.add-work-body-finish-button {
    width: 33%;
    height: 40px;
    display: inline-block;
    text-align: center;
    padding-top: 10px;
    background: #eeeeee;
    padding-top: 10px;
    border-bottom-right-radius: 10px;
    font-weight: bold;
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