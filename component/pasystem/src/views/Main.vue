<template>
    <div id="main" class="main-container">
        <OnAir :isOnAir="onAir"></OnAir>
        <Grouping></Grouping>
        <input class="file-input" type="file" ref="file" @change="handleFileUpload()"/>
        <Top :selectedType="isTopPressedType" @select-top-button="handleTopButton"></Top>
        <List :groupList="groupList" :alarmList="playList" :reserveList="reserveAlarmList"
        @select-group-check="_handleGroupListCheckbox"
        @select-button="handleBroadCastLeftMenu"
        @select-reserve-item="handleReserveItemInfoWindow"
        @select-pause="handleReservePause"></List>
        <GroupList v-if="isShowingTopList('filter') ||
                         isShowingTopList('broadcast') ||
                         isShowingTopList('group_set_up')"
        :checkList="filterList" :type="isTopPressedType"
        ref="groupWindow""
        @select-checkbox="handleChangedCheckbox"
        @select-button="handleBroadCast"
        @select-remove="handleGroupRemove"></GroupList>
        <SoundList v-if="isShowingTopList('sound_set_up')" :list="alarmList"
        @select-add="handleSoundAdd" @select-remove="handleSoundRemove"></SoundList>
        <ReserveList v-if="isShowingTopList('scheduled_broadcast')" :list="reserveAlarmList"
        @select-button="handleReserveButton"
        @select-remove="handleReserveRemove"></ReserveList>
        <ReserveWindow v-if="isShowingTopList('reserve')"
        :groupList="groupList" :alarmList="alarmList"
        @select-add-reserve="handleReserveWindowButton"
        @select-cancel="handleReserveCancelButton"></ReserveWindow>
        <InfoWindow :isForGroup="isForGroup" ref="infowindow" :item="infoWindowItem" :leftSoundItemId="leftSelectedSoundId"
        v-if="isShowingInfoWindow" :onAir="onAir"
        @select-close="handleInfoWindowClose"></InfoWindow>
        <ContextMenu v-if="isShowingContextMenu" :speaker="contextMenuItem" :position="markerPosition"
        @select-edit="handleEditGroup"></ContextMenu>
        <ReserveItemInfoWindow v-if="isShowingTopList('reserveItem')" :id="leftSelectedReserveId"
        @select-remove="handleReserveRemove"
        @select-pause="handleReservePause"></ReserveItemInfoWindow>
        <div :id="id" class="map-container">
        </div>
    </div>
</template>
<script>
import * as maptalks from 'maptalks';
import Top from '@/components/Top';
import List from '@/components/List';
import GroupList from '@/components/topList/GroupList';
import SoundList from '@/components/topList/SoundList';
import ReserveList from '@/components/topList/ReserveList';
import ReserveWindow from '@/components/topList/ReserveWindow';
import InfoWindow from '@/components/InfoWindow';
import ContextMenu from '@/components/ContextMenu';
import ReserveItemInfoWindow from '@/components/topList/ReserveItemInfoWindow';
import OnAir from '@/components/OnAir';
import Grouping from '@/components/Grouping';
import { EventBus } from "@/main";
export default {
    name: 'Main',
    components: {
        Top,
        GroupList,
        SoundList,
        ReserveList,
        InfoWindow,
        ContextMenu,
        List,
        ReserveWindow,
        ReserveItemInfoWindow,
        OnAir,
        Grouping
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
            polygonTitles: {},
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
            reserveAlarmList: [],
            setIntervalData: {},
            playList: [],
            leftSelectedSoundId: '',
            leftSelectedReserveId: '',
            onAir: false,
            groupingGroupId: null,
            isGrouping: false,
            groupingList: [],
            polygonSetting: {
                play : {
                    polygonFill: 'rgb(255, 75, 25)',
                    polygonOpacity: 0.5,
                    lineColor: 'rgb(255, 75, 25)',
                    lineWidth: 4
                },
                select : {
                    polygonFill: 'rgb(235, 255, 25)',
                    polygonOpacity: 0.5,
                    lineColor: 'rgb(235, 255, 25)',
                    lineWidth: 4
                },
                ready : {
                    polygonFill: 'rgb(25, 255, 25)',
                    polygonOpacity: 0.5,
                    lineColor: 'rgb(25, 255, 25)',
                    lineWidth: 4
                }
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
                    this._getPlayList();
                    this._getReserveAlarmList();
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
        _getStreamingStatus() {
            this.services.getStreamStatus(data => {
                if (Object.keys(data).length == 0) {
                    this.$store.commit('updateStreamingStatus', false)
                    this.$store.commit('updateNowPlaying', window.CONSTANTS.PLAY_STATUS.READY_FOR_STREAM)
                    this.onAir = false;
                } else {
                    this.$store.commit('updateStreamingStatus', true)
                    this.$store.commit('updateNowPlaying', window.CONSTANTS.PLAY_STATUS.OTHER_STREAM)
                    this.onAir = true;
                    const groupIdList = data.cast_id;
                    this._handleGroupListPlay(groupIdList);
                    EventBus.$emit("g-streaming-status", {"groupIdList": groupIdList, "status": true});
                }
            }, (error) => {
                console.log("Failed to get stream data");
            });
        },
        _getGroupList() {
            this._registerItemsByTag('none');
            this.services.getGroupData(list => {
                this._.forEach(list, group => {
                    this.$store.commit('addGroup', group);
                    this.groupList.push(group.id);
                    this._registerItemsByTag(group.id);
                });
                this._getSpeakers();
            }, (error) => {
                console.log("Failed to get group list");
            });
        },
        _getPlayList() {
            this.services.getPlayList(list => {
                this._.forEach(list, playList => {
                    this.playList.push(playList);
                    this.$store.commit('addPlayList', playList);
                });
            }, (error) => {
                console.log("Failed to get playlist.");
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
                    this._getStreamingStatus();
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
                  fileUrl = `${ window.CONSTANTS.URL.BASE_IMG }icon-pa-round.svg`,
                  marker = new maptalks.Marker(
                    [location.x, location.y], {
                        symbol: {
                            markerFile: fileUrl,
                            markerWidth: this.zoomLevel,
                            markerHeight: this.zoomLevel,
                            markerDy: 10
                        },
                        draggable: false
                    }
                  );
            let tag = this._.first(speaker.tags);
            if (!!tag && this._.has(this.speakerByTags, tag)) {
                this.speakerByTags[tag].push(speaker.id);
            } else {
                tag = 'none';
            }
            if (!speaker.status) {
                marker.updateSymbol({
                    markerFile: `${ window.CONSTANTS.URL.BASE_IMG }speaker-offline.png`
                });
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
                if (this.isGrouping) {
                    if (this.groupingList.indexOf(speaker.id) >=0 ) {
                        this.groupingList = this._.without(this.groupingList, speaker.id);
                        if (speaker.status) {
                            marker.updateSymbol({
                                markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-pa-round.svg`
                            });
                        } else {
                            marker.updateSymbol({
                                markerFile: `${ window.CONSTANTS.URL.BASE_IMG }speaker-offline.png`
                            });
                        }
                    } else {
                        this.groupingList.push(speaker.id);
                        marker.updateSymbol({
                            markerFile: `${ window.CONSTANTS.URL.BASE_IMG }speaker-check.png`
                        });
                    }
                } else {
                    this.isTopPressedType = '';
                    this.infoWindowItem = {};
                    this.$nextTick(() => {
                        this.infoWindowItem = speaker;
                        this.contextMenuItem = null;
                        this.isForGroup = false;
                    });
                }
            });

            // Right click context menu
            // marker.on('contextmenu', (e) => {
            //     e.domEvent.stopPropagation();
            //     this.isTopPressedType = '';
            //     this.infoWindowItem = null;
            //     this.contextMenuItem = {};
            //     this.$nextTick(() => {
            //         this.contextMenuItem = speaker;
            //         this._setContextMenuPosition();
            //     });
            // });
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
                symbol: this.polygonSetting.ready
            });
            polygon.addTo(this.polygonLayers[tag]);
            this.polygons[tag] = polygon;
            this._drawPolygonTitle(polygonList, tag);
        },
        _drawPolygonTitle(polygonList, tag) {
                let xLocation = 0,
                    yLocation = 0,
                    size = 0;
                this._.forEach(polygonList, (location) => {
                    xLocation += location[0];
                    yLocation += location[1];
                    size += 1;
                });
                if (this.polygonTitles[tag] !== undefined) {
                    this.polygonTitles[tag].remove();
                    delete this.polygonTitles[tag];
                }
                if (size > 1) {
                    const group = this.$store.getters.getGroup(tag),
                          text = new maptalks.Marker(
                        [(xLocation / size), (yLocation / size)],
                        {
                            'properties': {
                                'name': group.name
                            },
                            'symbol': {
                                'textSize': 20,
                                'textName': '{name}',
                                'textWeight': 'bold',
                                'textFill': '#34495e',
                                'textOpacity': 1,
                                'textHaloFill': '#fff',
                                'textHaloRadius': 2,
                                'textLineSpacing': 0,
                                'textHorizontalAlignment': 'middle',
                                'textVerticalAlignment': 'middle',
                                'textAlign': 'center'
                            }
                        }
                    );
                    text.addTo(this.polygonLayers[tag]);
                    this.polygonTitles[tag] = text;
                }
        },
        _removePolygon(tag) {
            const polygon = this.polygons[tag];
            if (!!polygon) {
                polygon.hide();
                delete this.polygons[tag];
                if (this.polygonTitles[tag] !== undefined) {
                    this.polygonTitles[tag].remove();
                    delete this.polygonTitles[tag];
                }
            }
        },
        _updatePolygon(tag) {
            const polygon = this.polygons[tag],
                  groupList = this.speakerByTags[tag];
            if (!!polygon) {
                const locationList = this._sortLocationList(groupList);
                polygon.setCoordinates(locationList);
                this._drawPolygonTitle(locationList, tag);
            } else {
                if (groupList.length > 0) {
                    this._drawPolygon(groupList, tag);
                }
            }
        },
        _getAlarmList() {
            this.services.getAlarmList((list) => {
                console.log('Success to get alarm data', list);
                this._.forEach(list, (data) => {
                    this.alarmList.push(data.id);
                    this.$store.commit('addAlarmData', data);
                });
            }, (error) => {
                console.log("Failed to get alarm list ", error);
            });
        },
        _getReserveAlarmList() {
            this.services.getReserveAlarmList((list) => {
                console.log("Success to get reserve alarm data", list);
                this._.forEach(list, (data) => {
                    this.reserveAlarmList.push(data.id);
                    this.$store.commit('addReserveAlarmData', data);
                });
            }, (error) => {
                console.log("Failed to get reserve alarm data", error);
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
                    // TODO: X position
                    //x: _position.x, // origin
                    x: _position.x + 250,
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
        handleReserveItemInfoWindow(reserveId) {
            this.isTopPressedType = 'reserveItem';
            this.leftSelectedReserveId = reserveId;
        },
        _handleGroupListCheckbox(item, checked) {
            var zone = this.polygonLayers[item];
            var polygons = this.polygons[item];
            if (checked) {
                polygons.updateSymbol(this.polygonSetting.select)
            } else {
                polygons.updateSymbol(this.polygonSetting.ready)

            }
        },
        _handleGroupListCheckBoxAll(checked) {
            if (checked) {
                this._.forEach(this.polygons, polygon => {
                    polygon.updateSymbol(this.polygonSetting.select)
                });
            } else {
                this._.forEach(this.polygons, polygon => {
                    polygon.updateSymbol(this.polygonSetting.ready)
                });
            }
        },
        _handleGroupListReady(groupList) {
            let polygonList = [];
            this._.forEach(groupList, groupId => {
                polygonList.push(this.polygons[groupId]);
            })
            this._.forEach(polygonList, polygon => {
                polygon.updateSymbol(this.polygonSetting.ready)
            });
        },
        _handleGroupListSelect(groupList) {
            let polygonList = [];
            this._.forEach(groupList, groupId => {
                polygonList.push(this.polygons[groupId]);
            })
            this._.forEach(polygonList, polygon => {
                polygon.updateSymbol(this.polygonSetting.select)
            });
        },
        _handleGroupListPlay(groupList) {
            let polygonList = [];
            this._.forEach(groupList, groupId => {
                polygonList.push(this.polygons[groupId]);
            })
            this._.forEach(polygonList, polygon => {
                polygon.updateSymbol(this.polygonSetting.play)
            });
        },
        handleChangedCheckbox(item, checked) {
            this._handleFilterGroup(item, checked);
        },
        handleBroadCast(list) {
            this.infoWindowItem = list;
            this.isTopPressedType = '';
        },
        handleBroadCastLeftMenu(list, soundId) {
            this.infoWindowItem = list;
            this.isForGroup = true;
            this.leftSelectedSoundId = soundId;
            this.isTopPressedType = '';
        },
        handleInfoWindowClose() {
            this.infoWindowItem = null;
        },
        handleEditGroup(type, groupId) {
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
                    if (this.speakerByTags[groupId] === undefined) {
                        this.speakerByTags[groupId].push(speaker.id);
                    }
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
        handleGroupRemove(list) {
            var resIdList = [];
            const reserveList = this.reserveAlarmList,
                  reserveRemove = this.handleReserveRemove,
                  checkListInit = this.$refs.groupWindow.groupCheckListInit,
                  removeGroup = this.services.removeGroupData;
            this._.forEach(reserveList, reserveID => {
                var reserveData = this.$store.getters.getReserveAlarmData(reserveID);
                this._.forEach(reserveData.group_id_list, group_id => {
                    if (list.id_list[0] == group_id) {
                        resIdList.push(reserveID);
                    }
                });
            });
            if (resIdList.length == 0) {
                this.services.removeGroupData(list, () => {
                    checkListInit();
                    console.log("Succeed to remove group data ", list);
                }, (error) => {
                    checkListInit();
                    console.error("Failed to remove group data", error);
                });
            } else {
                this.sweetbox.fire({
                    title: 'This group data is already scheduled.',
                    text: "The group data you are trying to delete is linked to the reservation broadcasting. Are you sure you want to delete all linked reservations and group data?",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!',
                    cancelButtonText: 'No, cancel!',
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: true
                }).then(function(isConfirm) {
                    if (isConfirm.value === true) {
                        reserveRemove(resIdList);
                        removeGroup(list, () => {
                            checkListInit();
                            console.log("Succeed to remove group data ", list);
                        }, (error) => {
                            checkListInit();
                            console.error("Failed to remove group data", error);
                        });
                    }
                });
            }
        },
        handleSoundRemove(list) {
            var resIdList = [];
            const reserveList = this.reserveAlarmList,
                  fileDel = this.services.removeAlarmData,
                  reserveRemove = this.handleReserveRemove,
                  fileDelData = {
                    id_list: list
                  };
            this._.forEach(reserveList, reserveID => {
                var reserveData = this.$store.getters.getReserveAlarmData(reserveID);
                if (list[0] == reserveData.alarm_id) {
                    resIdList.push(reserveID);
                }
            });
            if (resIdList.length == 0) {
                this.services.removeAlarmData(fileDelData, () => {
                    console.log("Succeed to remove alarm data");
                    this._.forEach(list, id => {
                        this.$store.commit('removeAlarmData', id);
                        this.alarmList = this._.without(this.alarmList, id);
                    });
                }, (error) => {
                    console.error("Failed to remove alarm data ", error);
                });
            } else {
                this.sweetbox.fire({
                    title: 'This alarm file is already scheduled.',
                    text: "The alarm file you are trying to delete is linked to the reservation broadcasting. Are you sure you want to delete all linked reservations and alarm file?",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!',
                    cancelButtonText: 'No, cancel!',
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: true
                }).then(function(isConfirm) {
                    if (isConfirm.value === true) {
                        reserveRemove(resIdList);
                        fileDel(fileDelData, (resp) => {
                            console.log("Succeed to remove alarm data");
                        }, (error) => {
                            console.error("Failed to remove alarm data ", error);
                        });
                    }
                });
            }
        },
        handleReserveWindowButton(data) {
            let repeat = data.repeat;
            if (data.type == 1) {
                // type is blasting then repeat is normal
                repeat = 0;
            }
            let _data = {
                type: data.type,
                repeat: repeat,
                hour: data.hour,
                minute: data.minute,
                alarm_id: data.alarmId,
                group_id_list: data.groupList,
                name: data.name,
                pause: 0
            };
            this.services.createReserveAlarm(_data, (resdata) => {
                if (resdata === '1') {
                  this.sweetbox.fire('There is a pre-scheduled broadcast at the requested time. Your request has been canceled.');
                } else {
                  console.log("Succeed to add reserve alarm");
                }
            }, (error) => {
                console.log("Failed to add reserve alarm");
            });
            this.isTopPressedType = '';
        },
        handleReserveCancelButton() {
            this.isTopPressedType = '';
        },
        handleReserveButton(data) {
            console.log("data", data)
            let _data = {
                type: data.reserve_time.type,
                hour: data.reserve_time.hour,
                minute: data.reserve_time.minute,
                alarm_id: data.sound[0],
                group_id_list: data.group
            };
            this.services.createReserveAlarm(_data, (resdata) => {
                if (resdata === '1') {
                  this.sweetbox.fire('There is a pre-scheduled broadcast at the requested time. Your request has been canceled.');
                } else {
                  console.log("Succeed to add reserve alarm");
                }
            }, (error) => {
                console.log("Failed to add reserve alarm");
            });
            this.isTopPressedType = '';
        },
        handleReserveRemove(list){
            const data = {
                id_list: list
            };
            this.services.removeReserveAlarm(data, () => {
                console.log("Succeed to remove reserve alarm");
                this._.forEach(list, id => {
                    this.$store.commit('removeReserveAlarmData', id);
                    this.reserveAlarmList = this._.without(this.reserveAlarmList, id);
                });
            }, (error) => {
                console.log("Failed to remove reserve alarm", error);
            });
            this.isTopPressedType = '';
        },
        handleReservePause(itemId, isPause) {
            const data = {
                id: itemId,
                pause: isPause
            }
            this.services.pauseReserveAlarm(data, (ret) => {
                console.log("Success to pause reserve alarm", ret);
            }, (error) => {
                console.log("Failed to pause reserve alarm", error);
            })
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
                    console.log("received", data);
                    this._handleAdded(data.v);
                },
                updated: (data) => {
                    console.log("received", data);
                    this._handleUpdated(data.v);
                },
                removed: (data) => {
                    console.log("received", data);
                    this._handleRemoved(data);
                },
                updateAlarmList: (data) => {
                    console.log("received", data);
                    this._handleUpdateAlarmList(data);
                },
                updateGroupList: (data) => {
                    console.log("received", data);
                    this._handleUpdateGroupList(data);
                },
                updateReserveList: (data) => {
                    console.log("received", data);
                    this._handleUpdateReserveList(data);
                },
                updateStreamingStatus: (data) => {
                    console.log("received", data);
                    this._handleStreamingStatus(data);
                },
                online: (data) => {
                    this._handleOnline(data.v);
                },
                offline: (data) => {
                    this._handleOffline(data.v);
                },
                failedList: (data) => {
                    this._handleFailedList(data);
                },
                updatePlayList: (data) => {
                    this._handlePlayList(data);
                },
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
            const list = data.v;
            this._.forEach(list, item => {
                if (data.kind === 'add') {
                    this.$store.commit('addAlarmData', item);
                    this.alarmList.push(item.id);
                } else if (data.kind === 'remove') {
                    this.$store.commit('removeAlarmData', item);
                    this.alarmList = this._.without(this.alarmList, item);
                } else if (data.kind === 'update') {

                }
            });
        },
        _handleUpdateGroupList(data) {
            const list = data.v;
            this._.forEach(list, item => {
                if (data.kind === 'add') {
                    this.$store.commit('addGroup', item);
                    this.groupList.push(item.id);
                    this._registerItemsByTag(item.id);
                } else if (data.kind === 'remove') {
                    this.$store.commit('removeGroup', item); //TODO
                    this.groupList = this._.without(this.groupList, item);
                    this._removePolygon(item);
                    this._.forEach(this.speakerByTags[item], speakerId => {
                        const speaker = this.$store.getters.getSpeaker(speakerId);
                        speaker.tags = [];
                        this.updateData(speaker);
                        this.$store.commit('updateSpeaker', speaker);
                    });
                } else if (data.kind === 'update') {
                    const group = this.$store.getters.getGroup(item.id);
                    group.name = item.name;
                    this.$store.commit('updateGroup', group);
                    this._updatePolygon(item.id);
                }
            });
        },
        _handleUpdateReserveList(data) {
            const list = data.v;
            this._.forEach(list, item => {
                if (data.kind === 'add') {
                    this.$store.commit('addReserveAlarmData', item);
                    this.reserveAlarmList.push(item.id);
                } else if (data.kind === 'remove') {
                    this.$store.commit('removeReserveAlarmData', item); //TODO
                    this.reserveAlarmList = this._.without(this.reserveAlarmList, item);
                } else if (data.kind === 'update') {
                    this.$store.commit('updateReserveAlarmData', item);
                    EventBus.$emit("g-reserve-item-pause", item);
                }
            });
        },
        _handleStreamingStatus(data) {
            //TODO: event handling
            const isStatus = data.v.status,
                  groupIdList = data.v.groupIdList,
                  nowStatus = this.$store.getters.getNowPlaying;
            this.$store.commit('updateStreamingStatus', isStatus)
            this.onAir = isStatus;
            if (!isStatus) {
                this.$store.commit('updateNowPlaying', 0)
                this._handleGroupListReady(groupIdList);
            } else {
                this._handleGroupListPlay(groupIdList);
                if (nowStatus == 0) {
                    this.$store.commit('updateNowPlaying', 2)
                }
            }
            EventBus.$emit("g-streaming-status", data.v);
        },
        _handleOnline(data) {
            switch(data.kind) {
                case window.CONSTANTS.PRODUCT_KIND.SPEAKER:
                    this._handleSpeakerOnline(data.v);
                break;
            }
        },
        _handleOffline(data) {
            switch(data.kind) {
                case window.CONSTANTS.PRODUCT_KIND.SPEAKER:
                    this._handleSpeakerOffline(data.v);
                break;
            }
        },
        _handleSpeakerOnline(data) {
            let speakerMarker = this.markers[data.id],
                speakerData = this._.clone(this.$store.getters.getSpeaker(data.id));
            speakerData.status = 1;
            this.$store.commit('updateSpeaker', speakerData);
            if (!!speakerMarker) {
                speakerMarker.updateSymbol({
                    markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-pa-round.svg`
                });
            }
        },
        _handleSpeakerOffline(data) {
            let speakerMarker = this.markers[data.id],
                speakerData = this._.clone(this.$store.getters.getSpeaker(data.id));
            speakerData.status = 0;
            this.$store.commit('updateSpeaker', speakerData);
            if (!!speakerMarker) {
                speakerMarker.updateSymbol({
                    markerFile: `${ window.CONSTANTS.URL.BASE_IMG }speaker-offline.png`
                });
            }
        },
        _handleFailedList(data) {
            var respName = data.v,
                nameList = respName.join(',');
            this.sweetbox.fire('speaker does not contain an IP address. Target Speaker : ' + nameList)
        },
        _handlePlayList(data) {
            const list = data.v;
            this._.forEach(list, item => {
                if (data.kind === 'add') {
                    this.$store.commit('addPlayList', item);
                    this.playList.push(item);
                } else if (data.kind === 'remove') {
                    this.$store.commit('removePlayList', item);
                    this.playList = this._.without(this.playList, item);
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
            this.$refs.infowindow.handleSelectCloseButton();
            this.services.unsubscribe();
        });
        EventBus.$on('g-open-infowindow', (v) => {
            this._handleGroupListPlay(v);
        })
        EventBus.$on('g-close-infowindow', (v) => {
            this._handleGroupListCheckBoxAll(false);
        })
        EventBus.$on('g-open-reserve-item-infowindow', (v) => {
            this._handleGroupListSelect(v);
        })
        EventBus.$on('g-close-reserve-item-infowindow', (v) => {
            this._handleGroupListReady(v);
        })
        EventBus.$on('g-grouping-fire', (v) => {
            if (this.speakerByTags[v.id] !== null) {
                this._.forEach(this.speakerByTags[v.id], speakerId => {
                    let marker = this.markers[speakerId];
                    this.markers[speakerId].updateSymbol({
                        markerFile: `${ window.CONSTANTS.URL.BASE_IMG }speaker-check.png`
                    });
                    this.groupingList.push(speakerId);
                });
            }
            this.isGrouping = true;
            this.groupingGroupId = v.id;
            this.isTopPressedType = '';
        })
        EventBus.$on('g-grouping-finish', (v, info) => {
            if (v) {
                const group = this.$store.getters.getGroup(info.id);
                if (!!group) {
                    group.speaker_id_list = this.groupingList;
                    this.speakerByTags[info.id] = this.groupingList;
                    this.updateGroupData(group);

                    this._.forEach(group.speaker_id_list, speakerId => {
                        this._.forEach(this.speakerByTags, (value, key) => {
                            if (key !== info.id) {
                                this.speakerByTags[key] = this._.without(this.speakerByTags[key], speakerId);
                            }
                        })
                        const speaker = this.$store.getters.getSpeaker(speakerId),
                              marker = this.markers[speaker.id];
                        speaker.tags = [info.id];
                        this.$store.commit('updateSpeaker', speaker);
                        this.updateData(speaker);
                        if (speaker.status) {
                            marker.updateSymbol({
                                markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-pa-round.svg`
                            });
                        } else {
                            marker.updateSymbol({
                                markerFile: `${ window.CONSTANTS.URL.BASE_IMG }speaker-offline.png`
                            });
                        }
                    });
                    this._.forEach(this.speakerByTags, (value, key) => {
                        if (key !== info.id && key !== 'none') {
                            const _group = this.$store.getters.getGroup(key);
                            this.updateGroupData(_group);
                        }
                    })
                }
            } else {
                this._.forEach(this.speakerByTags[info.id], speakerId => {
                    const speaker = this.$store.getters.getSpeaker(speakerId),
                          marker = this.markers[speaker.id];
                    if (speaker.status) {
                        marker.updateSymbol({
                            markerFile: `${ window.CONSTANTS.URL.BASE_IMG }icon-pa-round.svg`
                        });
                    } else {
                        marker.updateSymbol({
                            markerFile: `${ window.CONSTANTS.URL.BASE_IMG }speaker-offline.png`
                        });
                    }
                });
            }
            this.isGrouping = false;
            this.groupingList = [];
            this.groupingGroupId = null;
        })
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
    width: calc(100% - 250px);
    height: calc(100% - 40px);
    margin-left: 250px;
}
.file-input {
    display: none !important;
}
</style>