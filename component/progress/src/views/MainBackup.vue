<template>
    <div id="main" class="main-container">
        <Top :selectedType="isTopPressedType" @select-top-button="handleTopButton"></Top>
        <ProgressEditor></ProgressEditor>
        <div :id="id" class="map-container">
        </div>
    </div>
</template>
<script>
import * as maptalks from 'maptalks';
import Top from '@/components/Top';
import ContextMenu from '@/components/ContextMenu';
import ProgressEditor from '@/components/ProgressEditor';
export default {
    name: 'Main',
    components: {
        Top,
        ContextMenu,
        ProgressEditor
    },
    data() {
        return {
            id: 'map',
            info: {},
            map: null,
            paLayers: {},
            polygonLayers: {},
            zoomLevel: 0,
            markers: {},
            polygons: {},
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
            progressLayer: null,
            workLayer: null,
            workColor: {
                '0': '#ffffff',
                'a': '#ff0000',
                'b': '#00ff00',
                'c': '#0000ff'
            },
            mockData: [
                // {'id': 0, 'x': 71.9, 'y': 61.73317965522793, 'width': 100000, 'height': 110000, 'status': 'a',
                //  'name': 'progress0', 'current': '355m'},
                // {'id': 1, 'x': 71.9, 'y': 71.73317965522793, 'width': 100000, 'height': 110000, 'status': 'a',
                //  'name': 'progress1', 'current': '955m'},
                // {'id': 2, 'x': 71.9, 'y': 51.73317965522793, 'width': 100000, 'height': 110000, 'status': 'a',
                //  'name': 'progress2', 'current': '905m'},
                // {'id': 3, 'x': 71.9, 'y': 56.73317965522793, 'width': 100000, 'height': 110000, 'status': 'b',
                //  'name': 'progress3', 'current': '935m'},
                // {'id': 4, 'x': 71.9, 'y': 66.73317965522793, 'width': 100000, 'height': 110000, 'status': 'b',
                //  'name': 'progress4', 'current': '925m'},
                {'id': 5, 'x': 77.4, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress5', 'current': '915m'},
                // {'id': 6, 'x': 83, 'y': 56.50437, 'width': 80000, 'height': 110000, 'status': 'a',
                //  'name': 'progress6', 'current': '985m'},
                {'id': 7, 'x': 78.5, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress7', 'current': '775m'},
                {'id': 8, 'x': 79.6, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress8', 'current': '7955m'},
                {'id': 9, 'x': 80.7, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress9', 'current': '805m'},
                {'id': 10, 'x': 81.8, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                // {'id': 11, 'x': 51.8, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                //  'name': 'progress10', 'current': '815m'},
                // {'id': 12, 'x': 50.7, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                //  'name': 'progress10', 'current': '815m'},
                // {'id': 13, 'x': 49.6, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                //  'name': 'progress10', 'current': '815m'},
                // {'id': 14, 'x': 48.5, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                //  'name': 'progress10', 'current': '815m'},
                // {'id': 15, 'x': 47.4, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                //  'name': 'progress10', 'current': '815m'},
                {'id': 161, 'x': 88.9, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 179, 'x': 87.8, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 189, 'x': 86.7, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 190, 'x': 85.6, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 222, 'x': 84.5, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 16, 'x': 90, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 17, 'x': 91.1, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 18, 'x': 92.2, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 19, 'x': 93.3, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 20, 'x': 94.4, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 21, 'x': 95.5, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'a',
                 'name': 'progress10', 'current': '815m'},
                {'id': 22, 'x': 96.6, 'y': 51.73317965522793, 'width': 80000, 'height': 110000, 'status': 'a',
                 'name': 'progress10', 'current': '815m'},


                {'id': 1161, 'x': 88.9, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 1179, 'x': 87.8, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 1189, 'x': 86.7, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 1190, 'x': 85.6, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 1222, 'x': 84.5, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 116, 'x': 90, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 117, 'x': 91.1, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 118, 'x': 92.2, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 119, 'x': 93.3, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 120, 'x': 94.4, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 121, 'x': 95.5, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'a',
                 'name': 'progress10', 'current': '815m'},
                {'id': 122, 'x': 96.6, 'y': 54.73317965522793, 'width': 80000, 'height': 110000, 'status': 'a',
                 'name': 'progress10', 'current': '815m'},

                {'id': 2161, 'x': 88.9, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 2179, 'x': 87.8, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 2189, 'x': 86.7, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 2190, 'x': 85.6, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 2222, 'x': 84.5, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'c',
                 'name': 'progress10', 'current': '815m'},
                {'id': 12216, 'x': 90, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 12217, 'x': 91.1, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 12218, 'x': 92.2, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 12219, 'x': 93.3, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 12220, 'x': 94.4, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'b',
                 'name': 'progress10', 'current': '815m'},
                {'id': 12221, 'x': 95.5, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'a',
                 'name': 'progress10', 'current': '815m'},
                {'id': 12222, 'x': 96.6, 'y': 48.63317965522793, 'width': 91000, 'height': 120000, 'status': 'a',
                 'name': 'progress10', 'current': '815m'},

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
        initContextMenu() {
            this.contextMenuOption = {
                'custom': true,
                'items': `<div class="custom_menu">
                <div class="additem">
                    <div id="progressitem">ADD PROGRESS</div>
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

                document.getElementById('progressitem').onclick = () => {
                    this.map.closeMenu();
                    this.handleAddProgress();
                }
            });
        },
        handleAddProgress() {
            var drawTool = new maptalks.DrawTool({
                mode: 'Rectangle',
                once: true,
                symbol: {
                    lineColor: '#000000',
                    lineWidth: 1,
                    polygonFill: '#ffffff',
                    polygonOpacity: 1
                }
            }).addTo(this.map).disable();
            drawTool.setMode('Rectangle');
            var layer = this.progressLayer,
                workColor = this.workColor,
                setContextMenu = this.setContextMenu,
                setProgressInfoWindow = this.setProgressInfoWindow,
                store = this.$store,
                drawWork = this.drawWork;
            drawTool.on('drawend', function(param) {
                var xlist = [param.geometry._coordinates[0].x, param.geometry._coordinates[1].x, param.geometry._coordinates[2].x, param.geometry._coordinates[3].x]
                var ylist = [param.geometry._coordinates[0].y, param.geometry._coordinates[1].y, param.geometry._coordinates[2].y, param.geometry._coordinates[3].y]
                xlist.sort();
                ylist.sort();

                let progressId = Math.floor(Math.random()*(100)) + 25;
                var marker = new maptalks.Rectangle([xlist[0], ylist[ylist.length - 1]], 100000, 110000, {
                    id: progressId,
                    enableSimplify: false,
                    symbol: {
                        lineColor: '#110220',
                        lineWidth: 0,
                        polygonFill: '#ffff00',
                        polygonOpacity: 1
                    }
                });
                layer.addGeometry(marker);
                setContextMenu(marker);
                setProgressInfoWindow(marker);
                let progress = {'id': progressId, 'x': xlist[0], 'y': ylist[ylist.length - 1], 'width': 100000, 'height': 110000, 'status': 'd',
                                'name': 'progress0', 'current': '355m'};
                store.commit('addProgress', progress);
                drawWork(progress);
                console.log("### end", drawTool);
                drawTool.setMode('Rectangle').disable();
            });
            drawTool.setMode('Rectangle').enable();
        },
        _registerMapHandler() {
            if (!!this.map) {
                this.map.once('baselayerload', () => {
                    this.zoomLevel = 50 * (this.map.getZoom() / 11);
                    this.progressLayer = new maptalks.VectorLayer('vector').addTo(this.map);
                    this.progressLayer.setZIndex(1);
                    this.workLayer = new maptalks.VectorLayer('vector1').addTo(this.map);
                    this.workLayer.setZIndex(2);
                    this.drawProgressList();
                });
                this.map.on('zoomend moveend', (e) => {
                    this.zoomLevel = 50 * (this.map.getZoom() / 11);
                    this._setContextMenuPosition();
                });
                this.map.on('click', (e) => {
                    this.closeInfoWindow();
                    this.closeAddWindow();
                    this.closeMenu();
                    this.isTopPressedType = '';
                });
            }
        },
        drawProgressList() {
            this._.forEach(this.mockData, (progress) => {
                this.drawProgress(progress);
            });
        },
        drawProgress(progress) {
            //var marker = new maptalks.Rectangle([progress.x, progress.y], progress.width, progress.height, {
            //var marker = new maptalks.TextBox("123 asjflasifj", [progress.x, progress.y], progress.width, progress.height, {
            var marker = new maptalks.TextBox("", [progress.x, progress.y],
                                              {stops: [[4, 10], [5, 20], [6, 30], [7, 40]]},
                                              {stops: [[4, 50], [5, 100], [6, 150], [7, 200]]}, {
                // id: progress.id,
                // enableSimplify: false,
                'editable': false,
                'draggable': true,
                'boxSymbol': {
                    'markerType': 'square',
                    'markerLineColor': '#000000',
                    'markerLineWidth': 1,
                    'markerFill': this.workColor[progress.status],
                    'markerFillOpacity': 1
                }
                // symbol: {
                //     lineColor: '#000000',
                //     lineWidth: 0,
                //     polygonFill: this.workColor[progress.status],
                //     polygonOpacity: 1
                // }
            });
            this.setContextMenu(marker);
            this.setProgressInfoWindow(marker);
            this.progressLayer.addGeometry([marker]);
            this.$store.commit('addProgress', progress);
            // this.drawWork(progress);
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
                [progress.x, progress.y], {
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
                    this.closeMenu();
                    marker.remove();
                    this.$store.commit('removeProgress', marker.id);
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
                console.log("#### item : ", item);
                console.log("#### checked : ", checked);
            if (checked) {
                this.paLayers[item].show();
                this.polygonLayers[item].show();
                this.filterList = this._.without(this.filterList, item);
            } else {
                this.paLayers[item].hide();
                this.polygonLayers[item].hide();
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
                    // TODO
                } else if (type === window.CONSTANTS.TOP_BUTTON_TYPE.BROADCAST) {
                    this.isForGroup = true;
                } else if (type === window.CONSTANTS.TOP_BUTTON_TYPE.SOUND_SET_UP) {
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

                // this.websocketConnect();
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