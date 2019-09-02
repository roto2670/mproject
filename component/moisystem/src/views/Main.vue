<template>
    <div id="Main" class="moi-main-container">
        <div class="moi-main-frame">
            <div class="moi-top-frame">
                <div class="moi-top-panel">
                    <Button v-for="(type, index) in buttonType" :key="index"
                    :type="type" :isSelected="selectedButtonType === type"
                    @select-button="handleSelectButton"></Button>
                </div>
            </div>
            <div class="moi-content-frame" ref="contentFrame">
                <!-- <full-screen/> -->
                <list :ipcams="ipcams" 
                :selectedList="selectedShowScreenList"
                @select-item="handleSelectedItem"
                @select-all="handleSelectedAll"
                @select-close-list="handleSelectedCloseList"
                @select-close-all-list="handleCloseAllList"/>
                <grid-screen :list="selectedShowScreenList"/>
            </div>
        </div>
    </div>
</template>
<script>
import List from '@/components/List';
import Button from '@/components/Button';
import FullScreen from '@/components/FullScreen';
import GridScreen from '@/components/GridScreen';
import { EventBus } from '@/main.js';
export default {
    name: 'Main',
    components: {
        List,
        Button,
        FullScreen,
        GridScreen
    },
    props: {
        info: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            ipcams: [],
            buttonType: window.CONSTANTS.BUTTON_TYPE,
            selectedButtonType: 1,
            screenWidth: 0,
            selectedShowScreenList: []
        }
    },
    methods: {
        handleSelectButton(type) {
            if (this.selectedButtonType === type) {
                this.selectedButtonType = 1;
            } else {
                this.selectedButtonType = 1;
            }
        },
        handleSelectedItem(id) {
            if (!this._.includes(this.selectedShowScreenList, id)) {
                if (this._.size(this.selectedShowScreenList) < window.CONSTANTS.MAX_SHOWING_SCREEN) {
                    this.openStreaming(id);
                }
            } else {
                this.closeStreaming(id)
            }
        },
        handleSelectedAll(list) {
            this.openIpcamStreaming(list, (streamingItems) => {
                this.handleOpenStreaming(streamingItems);
            });
        },
        handleOpenStreaming(streamingItems) {
            if (!this._.isEmpty(streamingItems)) {
                this._.forEach(streamingItems, (item) => {
                    const gadgetId = this._.keys(item)[0];
                    let resData = item[gadgetId];
                    if (!!resData) {
                        if (this._.isString(resData)) {
                            this.$store.commit('addStreamingURL', item);
                            EventBus.$emit('openStreamURL', gadgetId);
                            this.selectedShowScreenList.push(gadgetId);
                        } else {
                            this.handleErrorStreaming(resData, () => {
                                this.selectedShowScreenList = this._.without(this.selectedShowScreenList, gadgetId);
                            });
                        }
                    }
                });
            }
        },
        handleSelectedCloseList() {
            this.selectedButtonType = 1;
        },
        openStreaming(gadgetId) {
            this.openIpcamStreaming([gadgetId], (streamingItems) => {
                this.handleOpenStreaming(streamingItems); 
            });
        },
        openIpcamStreaming(ipcamId, resultCallback) {
            this.services.openStreaming(ipcamId, (res) => {
                resultCallback(res);
            })
        },
        handleErrorStreaming(result, resultCallback) {
            let text = '';
            switch(result) {
                case window.CONSTANTS.STREAMING_ERROR_CODE.IPCAM_DISCONNECT:
                    text = 'Disconnected with this IPcam'
                break;
                case window.CONSTANTS.STREAMING_ERROR_CODE.STREAMING_FAILED:
                    text = 'Failed to open IPcam streaming'; 
                break;
                case window.CONSTANTS.STREAMING_ERROR_CODE.STREAMING_SERVER_DISCONNECT:
                    text = 'Disconnected with streaming server';
                break;
                case window.CONSTANTS.STREAMING_ERROR_CODE.LIMIT_STREAMING_ACCESS:
                    text = 'Exceeded the number of users who can access the IPcam';
                break;
                case window.CONSTANTS.STREAMING_ERROR_CODE.UNKNOWN_IPCAMID:
                    text = 'Unknown Ipcam Id';
                break;
            }
            this.sweetbox.fire({
                title: text
            }).then((res) => {
                resultCallback();
            });
        },
        closeStreaming(gadgetId) {
            this.services.closeStreaming([gadgetId], (streamingUrlList) => {
                if (!this._.isEmpty(streamingUrlList)) {
                    this.sweetbox.fire('Sorry, disconnect Ipcam Streaming failed');
                }
                this.$store.commit('removeStreamingURL', gadgetId);
                this.selectedShowScreenList = this._.without(this.selectedShowScreenList, gadgetId);
            });
        },
        handleCloseAllList() {
            this.services.closeStreaming(this.selectedShowScreenList, streamingUrlList => {
                if (!this._.isEmpty(streamingUrlList)) {
                    this.sweetbox.fire('Sorry, disconnect Ipcam Streaming failed');
                }
                this._.forEach(streamingUrlList, item => {
                    const gadgetId = this._.keys(item)[0];
                    this.$store.commit('removeStreamingURL', gadgetId);
                });
                this.selectedShowScreenList = [];
            });
        },
        _handleAdded(data) {
            if (!this.$store.getters.isIpcam(data)) {
                this.$store.commit('addIpcam', data);
            }
        },
        /*
            id: "admin"
            ip: "192.168.0.21"
            is_visible_moi: false
            map_location: {x: 109.423828125, y: 44.65471636831157}
            password: "admin"
        */
        _handleUpdated(data) {
            if (!!data.custom) {
                //TODO 보고 있을때 moi 꺼지면 알림주기
                if (!data.custom.is_visible_moi) {
                    if (this._.includes(this.selectedShowScreenList, data.id)) {
                        this.selectedShowScreenList = this._.without(this.selectedShowScreenList, data.id);
                    }
                }
                this.$store.commit("updateIpcam", data);
            }
        },
        _handleRemoved(data) {
            if (this.$store.getters.isIpcam(data)) {
                this.$store.commit('removeIpcam', data.id);
            }
        },
        _handleReopenStreaming(data) {
            this._.forEach(data, item => {
                const id = _.first(_.keys(item));
                if (this._.includes(this.selectedShowScreenList, id)) {
                    this.$store.commit('addStreamingURL', item);
                    EventBus.$emit('openStreamURL', id);
                }
            });
        },
        _handleOnline(data) {
            this._.forEach(this.ipcams, ipcam => {
                if (ipcam.id === data.id) {
                    ipcam.status = 1;
                }
            })
        },
        _handleOffline(data) {
            this._.forEach(this.ipcams, ipcam => {
                if (ipcam.id === data.id) {
                    ipcam.status = 0;
                }
            })
        },
        _subscribe() {
            this.services.subscribe(this.info.internal, {
                added: (data) => {
                    this._handleAdded(data.v);
                },
                updated: (data) => {
                    this._handleUpdated(data.v);
                },
                removed: (data) => {
                    this._handleRemoved(data.v);
                },
                reopenStreaming: (data) => {
                    this._handleReopenStreaming(data.v);
                },
                online: (data) => {
                    this._handleOnline(data.v);
                },
                offline: (data) => {
                    this._handleOffline(data.v);
                }
            });
        },
        _sortIpcamStatus() {
            this.ipcams = this._.sortBy(this.ipcams, ['status']); 
            this.ipcams = this._.reverse(this.ipcams);
        }
    },
    computed: {
        isShowGridScreen() {
            return this._.size(this.selectedShowScreenList) > 0;
        }
    },
    created() {
        this._subscribe();
        this.services.getIpcams((ipcams) => {
            this.$store.commit('addIpcams', ipcams);
            this.ipcams = ipcams;
            this._sortIpcamStatus();
        });
    }
}
</script>
<style>
.moi-main-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(245, 245, 245);
}
.moi-main-frame {
    position: relative;
    width: 100%;
    height: 100%;
}
.moi-top-frame {
    width: 100%;
    height: 4em;
    background-color: rgb(235, 250, 250);
}
.moi-top-panel {
    width: 100%;
    height: 100%;
}
.moi-content-frame {
    position: relative;
    width: 100%;
    height: calc(100% - 4em);
}
</style>
