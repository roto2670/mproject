<template>
    <div id="main" class="main-container">
        <input class="file-input" type="file" ref="file" @change="handleFileUpload()"/>
        <Top :selectedType="isTopPressedType" @select-top-button="handleTopButton"></Top>
        <GroupList v-if="isShowingTopList('filter') ||
                         isShowingTopList('broadcast') ||
                         isShowingTopList('group_set_up')"
        :checkList="filterList" :type="isTopPressedType"
        @select-checkbox="handleChangedCheckbox"
        @select-button="handleBroadCast"></GroupList>
        <SoundList v-if="isShowingTopList('sound_set_up')" :list="alarmList"
        @select-add="handleSoundAdd" @select-remove="handleSoundRemove"></SoundList>
        <ReserveList v-if="isShowingTopList('scheduled_broadcast')"
        @select-button="handleReserveButton"
        @select-remove="handleReserveRemove"></ReserveList>
        <InfoWindow :isForGroup="isForGroup" :item="infoWindowItem" v-if="isShowingInfoWindow"
        @select-close="handleInfoWindowClose"></InfoWindow>
        <ContextMenu v-if="isShowingContextMenu" :speaker="contextMenuItem" :position="markerPosition"
        @select-edit="handleEditGroup"></ContextMenu>
        <div :id="id" class="map-container">
        </div>
    </div>
</template>
<script>
import * as maptalks from 'maptalks';
import Top from '@/components/Top';
import GroupList from '@/components/topList/GroupList';
import SoundList from '@/components/topList/SoundList';
import ReserveList from '@/components/topList/ReserveList';
import InfoWindow from '@/components/InfoWindow';
import ContextMenu from '@/components/ContextMenu';
export default {
    name: 'Main',
    components: {
        Top,
        GroupList,
        SoundList,
        ReserveList,
        InfoWindow,
        ContextMenu
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
            speakerByTags: {},
            infoWindowItem: null,
            contextMenuItem: null,
            markerPosition: null,
            checkInterval: null,
            isWebsoketConnected: false,
            groupList: [],
            filterList: [],
            isForGroup: false,
            isTopPressedType: '',
            alarmList: [],
            setIntervalData: {}
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
                this._registerMapHandler();
            });
        },
        _registerMapHandler() {
            if (!!this.map) {
                this.map.once('baselayerload', () => {
                    this.zoomLevel = 50 * (this.map.getZoom() / 11);
                    this._getGroupList();
                    this._getAlarmList();
                    this._getSpeakers();
                    if (!this._.has(this.paLayers, 'none')) {
                        this.paLayers['none'] = new maptalks.VectorLayer('panone').addTo(this.map);
                        this.paLayers['none'].setZIndex(1);
                    }
                });
                this.map.on('zoomend moveend', (e) => {
                    this.zoomLevel = 50 * (this.map.getZoom() / 11);
                    this._setContextMenuPosition();
                });
                this.map.on('click', (e) => {
                    this.infoWindowItem = null;
                    this.contextMenuItem = null;
                    this.isTopPressedType = '';
                });
            }
        },
        _registerItemsByTag(tag) {
            if (!this._.has(this.speakerByTags, tag)) {
                this.speakerByTags[tag] = [];
            }
            if (!this._.has(this.paLayers, tag)) {
                this.paLayers[tag] = new maptalks.VectorLayer(`pa${tag}`).addTo(this.map);
                this.paLayers[tag].setZIndex(1);
                this.polygonLayers[tag] = new maptalks.VectorLayer(`polygon${tag}`).addTo(this.map);
            }
        },
        _getGroupList() {
            this._registerItemsByTag('none');
            this.services.getGroupData(list => {
                this._.forEach(list, group => {
                    this.$store.commit('addGroup', group);
                    this._registerItemsByTag(group.id);
                });
            }, (error) => {
                console.log("Failed to get group list");
            });
        },
        _getSpeakers() {
            this.services.getSpeakers(speakers => {
                if (speakers !== 'error') {
                    console.log("Success to get speakers", speakers);
                    this._.forEach(speakers, speaker => {
                        let tag = this._.first(speaker.tags) || 'none';
                        this.$store.commit('addSpeaker', speaker);
                        if (!!speaker.custom.map_location) {
                            this._drawSpeaker(speaker);
                        }
                    });
                    this._drawPolygons();
                } else {
                    console.log("Failed to get speakers", speakers);
                }
            });
        },
        _drawSpeakers(speakers) {
            this._.forEach(speakers, speaker => {
                this._drawSpeaker(speaker);
            });
        },
        _drawSpeaker(speaker) {
            const location = speaker.custom.map_location,
                  groupData = this.$store.getters.getGroupList,
                  fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-pa-round.svg`,
                  marker = new maptalks.Marker(
                    [location.x, location.y], {
                        symbol: {
                            markerFile: fileUrl,
                            markerWidth: this.zoomLevel,
                            markerHeight: this.zoomLevel,
                            markerDy: 10
                        },
                        draggable: true
                    }
                  );
            let tag = this._.first(speaker.tags);
            if (!!tag && this._.has(groupData, tag)) {
                this.speakerByTags[tag].push(speaker.id);
            } else {
                tag = 'none';
            }
            marker.addTo(this.paLayers[tag]);
            this.markers[speaker.id] = marker;

            marker.on('dragend', (e) => {
                e.domEvent.stopPropagation();
                const tag = this._.first(speaker.tags),
                      coordinates = marker._coordinates;
                speaker.custom.map_location = {
                    x: coordinates.x,
                    y: coordinates.y
                };
                this._updatePolygon(tag);
                this.setLocationTimeout(speaker.id);
            });

            marker.on('click', (e) => {
                e.domEvent.stopPropagation();
                this.isTopPressedType = '';
                this.infoWindowItem = {};
                this.$nextTick(() => {
                    this.infoWindowItem = speaker;
                    this.contextMenuItem = null;
                    this.isForGroup = false;
                });
            });

            marker.on('contextmenu', (e) => {
                e.domEvent.stopPropagation();
                this.isTopPressedType = '';
                this.infoWindowItem = null;
                this.contextMenuItem = {};
                this.$nextTick(() => {
                    this.contextMenuItem = speaker;
                    this._setContextMenuPosition();
                });
            });
        },
        setLocationTimeout(id) {
            this.setIntervalData[id] = setTimeout(() => {
                let data = this.$store.getters.getSpeaker(id);
                if (this._.has(data.custom, 'map_location')) {
                    this.updateData(data);
                }
            }, 3000);
        },
        _drawPolygons() {
            this._.forEach(this.speakerByTags, (list, tag) => {
                this._drawPolygon(list, tag);
            });
        },
        _drawPolygon(groupList, tag) {
            const polygonList = this._sortLocationList(groupList);
            const polygon = new maptalks.Polygon(polygonList, {
                symbol: {
                    polygonFill: 'rgb(255, 75, 25)',
                    polygonOpacity: 0.5,
                    lineColor: 'rgb(255, 75, 25)',
                    lineWidth: 1
                }
            });
            polygon.addTo(this.polygonLayers[tag]);
            this.polygons[tag] = polygon;
        },
        _removePolygon(tag) {
            const polygon = this.polygons[tag];
            if (!!polygon) {
                polygon.hide();
                delete this.polygons[tag];
            }
        },
        _updatePolygon(tag) {
            const polygon = this.polygons[tag],
                  groupList = this.speakerByTags[tag];
            if (!!polygon) {
                const locationList = this._sortLocationList(groupList);
                polygon.setCoordinates(locationList);
            }
        },
        _getAlarmList() {
            this.services.getAlarmList((list) => {
                console.log('Success to get alarm data', list);
                this._.forEach(list, (data) => {
                    this.alarmList.push(data.id);
                    this.$store.commit('addAlarmData', data);
                    console.log("insert : ", data);
                });
            }, (error) => {
                console.log("Failed to get alarm list ", error);
            });
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
        _sortLocationList(list) {
            let locationList = [],
                polygonList = [],
                minX = 0,
                maxX = 0,
                minY = 0,
                maxY = 0,
                center = {};
            this._.forEach(list, (id, index) => {
                const speaker = this.$store.getters.getSpeaker(id),
                      mapLocation = this._.cloneDeep(speaker.custom.map_location);
                if (index === 0) {
                    minX = mapLocation.x;
                    maxX = mapLocation.x;
                    minY = mapLocation.y;
                    maxY = mapLocation.y;
                } else {
                    if (mapLocation.x < minX) minX = mapLocation.x;
                    if (mapLocation.x > maxX) maxX = mapLocation.x;
                    if (mapLocation.y < minY) minY = mapLocation.y;
                    if (mapLocation.y > maxY) maxY = mapLocation.y;
                }
                locationList.push(mapLocation);
            });
            center = {
                x: minX + (maxX - minX) / 2,
                y: minY + (maxY - minY) / 2
            };
            this._.forEach(locationList, (location, index) => {
                location.angle = Math.acos((location.x - center.x) / this._lineDistance(center, location));

                if (location.y > center.y) {
                    location.angle = Math.PI + Math.PI - location.angle;
                }
            });
            locationList = locationList.sort(function(a, b) {
                return a.angle - b.angle;
            });
            this._.forEach(locationList, location => {
                polygonList.push([location.x, location.y]);
            });
            return polygonList;
        },
        _lineDistance(point1, point2) {
            let xs = 0,
                ys = 0;

            xs = point2.x - point1.x;
            xs = xs * xs;

            ys = point2.y - point1.y;
            ys = ys * ys;

            return Math.sqrt(xs + ys);
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
        _handleFilterGroup(item, checked) {
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
                } else if (type === window.CONSTANTS.TOP_BUTTON_TYPE.FILTER) {
                    // TODO
                } else if (type === window.CONSTANTS.TOP_BUTTON_TYPE.BROADCAST) {
                    this.isForGroup = true;
                } else if (type === window.CONSTANTS.TOP_BUTTON_TYPE.SOUND_SET_UP) {
                }
            });
        },
        handleChangedCheckbox(item, checked) {
            this._handleFilterGroup(item, checked);
        },
        handleBroadCast(list) {
            this.infoWindowItem = list;
            this.isTopPressedType = '';
        },
        handleInfoWindowClose() {
            this.infoWindowItem = null;
        },
        handleEditGroup(type, groupId) {
            console.log("NNNNNNNNNNNNNNN type: ", type);
            if (!!this.contextMenuItem) {
                const speaker = this.$store.getters.getSpeaker(this.contextMenuItem.id),
                      marker = this.markers[speaker.id];
                marker.remove();
                if (type === window.CONSTANTS.CONTEXT_MENU_TYPE.REMOVE) {
                    const tag = this._.first(speaker.tags);
                    speaker.tags = [];
                    this.speakerByTags[tag] = this._.without(this.speakerByTags[tag], speaker.id);
                    this._updatePolygon(tag);
                } else {
                    if (type === window.CONSTANTS.CONTEXT_MENU_TYPE.CHANGE) {
                        const tag = this._.first(speaker.tags);
                        this.speakerByTags[tag] = this._.without(this.speakerByTags[tag], speaker.id);
                        this._updatePolygon(tag);
                    }
                    speaker.tags = [groupId];
                    this.speakerByTags[groupId].push(speaker.id);
                    this._updatePolygon(groupId);
                }
                this.updateData(speaker);
                const group = this.$store.getters.getGroup(groupId);
                if (!!group) {
                    group.speaker_id_list.push(speaker.id);
                    this.updateGroupData(group);
                }
                this.$store.commit('updateSpeaker', speaker);
                this._drawSpeaker(speaker);
            }
            this.contextMenuItem = {};
        },
        updateData(speaker) {
            this.services.updateData([speaker], speaker.kind, (data) => {
                if (data.v === 'error') {
                    console.log("Failed to update speaker data");
                } else {
                    console.log("Succeed to update speaker data");
                }
            });
        },
        updateGroupData(group) {
            const data = {
                id: group.id,
                speaker_id_list: group.speaker_id_list
            }
            this.services.updateSpeakerInGroup(data, () => {
                console.log("Success to update speaker in group");
            }, (error) => {
                console.warn("Failed to update speaker in group");
            });
        },
        handleSoundAdd() {
            this.$refs.file.click();
        },
        handleFileUpload() {
            const file = this.$refs.file.files[0];
            this.services.addAlarmData(file, () => {
                console.log('Success to add alarm data');
            }, (error) => {
                console.warn('Failed to add alarm data');
            });
        },
        handleSoundRemove(list) {
            const data = {
                id_list: list
            };
            this.services.removeAlarmData(data, () => {
                console.log("Succeed to remove alarm data");
                this._.forEach(list, id => {
                    this.$store.commit('removeAlarmData', id);
                    this.alarmList = this._.without(this.alarmList, id);
                });
            }, (error) => {
                console.log("Failed to remove alarm data ", error);
            });
        },
        handleReserveButton(data) {
            let time = new Date() / 1000.0;
            time += (data.reserve_time.hour * 3600);
            time += (data.reserve_time.minute * 60);
            time = new Date(time * 1000);
            let _data = {
                type: data.reserve_time.type,
                hour: time.getHours(),
                minute: time.getMinutes(),
                alarm_id: data.sound[0],
                group_id_list: data.group
            };
            this.services.createReserveAlarm(_data, () => {
                console.log("Succeed to add reserve alarm");
            }, (error) => {
                console.log("Failed to add reserve alarm");
            });
            this.isTopPressedType = '';
        },
        handleReserveRemove(list){
            console.log(data); //TODO 예약 삭제
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
                    this.websocketConnect();
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
                added: (data) => {
                    this._handleAdded(data.v);
                },
                updated: (data) => {
                    console.log("received", data);
                    this._handleUpdated(data.v);
                },
                removed: (data) => {
                    this._handleRemoved(data);
                },
                updateAlarmList: (data) => {
                    this._handleUpdateAlarmList(data);
                },
                updateGroupList: (data) => {
                    this._handleUpdateGroupList(data);
                }
            });
        },
        _handleAdded(data) {
            this.$store.commit('addSpeaker', data);
        },
        _handleUpdated(data) {
            //TODO :name, map_location, group
            let marker = this.markers[data.id],
                speakerData = this._.cloneDeep(this.$store.getters.getSpeaker(data.id));
            const beforeTagData = this._.first(speakerData.tags),
                  updateTagData = this._.first(data.tags);
            this._.extend(speakerData, data);
            this.$store.commit('addSpeaker', speakerData);
            if (!!data.custom) {
                if (this._.has(data.custom, 'map_location')) {
                    if (!!marker) {
                        marker.setCoordinates(data.custom.map_location);
                        this.markers[data.id] = marker;
                        this._updatePolygon(speakerData.tag);
                    } else {
                        this._drawSpeaker(speakerData);
                    }
                } else {
                    if (!!marker) {
                        marker.remove();
                        delete this.markers[data.id];
                        this.speakerByTags[beforeTagData] = this._.without(this.speakerByTags[beforeTagData], data.id);
                        this._updatePolygon(beforeTagData);
                    }
                }
            }

            if (!!data.tags) {
                this.speakerByTags[beforeTagData] = this._.without(this.speakerByTags[beforeTagData], data.id);
                this.speakerByTags[updateTagData].push(data.id);
                this._updatePolygon(beforeTagData);
                this._updatePolygon(updateTagData);
            }
        },
        _handleRemoved(data) {
            const speakerData = data.v,
                  marker = this.markers[speakerData.id];
            this.$store.commit('removeSpeaker', speakerData.id);
            if (!!marker) {
                const tag = this._.first(speakerData.tags);
                marker.remove();
                delete this.markers[speakerData.id];
                if (!!tag) {
                    this.speakerByTags[tag] = this._.without(this.speakerByTags[tag], speakerData.id);
                    this._updatePolygon(tag);
                }
            }
        },
        _handleUpdateAlarmList(data) {
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
                    this._registerItemsByTag(item.id);
                } else if (data.kind === 'remove') {
                    this.$store.commit('removeGroup', item); //TODO
                } else if (data.kind === 'update') {
                    const group = this.$store.getters.getGroup(item.id);
                    group.name = item.name;
                    this.$store.commit('updateGroup', group);
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
                this.startInterval();
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
</style>