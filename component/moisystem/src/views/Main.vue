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
                <list v-if="selectedButtonType === 0"
                :selectedList="selectedShowScreenList"
                @select-item="handleSelectedItem"
                @select-close-list="handleSelectedCloseList"/>
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
    data() {
        return {
            buttonType: window.CONSTANTS.BUTTON_TYPE,
            selectedButtonType: -1,
            screenWidth: 0,
            selectedShowScreenList: []
        }
    },
    methods: {
        handleSelectButton(type) {
            if (this.selectedButtonType === type) {
                this.selectedButtonType = -1;
            } else {
                this.selectedButtonType = type;
            }
        },
        handleSelectedItem(id) {
            if (!this._.includes(this.selectedShowScreenList, id)) {
                if (this._.size(this.selectedShowScreenList) < window.CONSTANTS.MAX_SHOWING_SCREEN) {
                    this.selectedShowScreenList.push(id);
                    this.openStreaming(id);
                }
            } else {
                this.closeStreaming(id)
                this.selectedShowScreenList = this._.without(this.selectedShowScreenList, id);
            }
        },
        handleSelectedCloseList() {
            this.selectedButtonType = -1;
        },
        openStreaming(gadgetId) {
            this.services.openStreaming([gadgetId], (streamingItems) => {
                if (!this._.isEmpty(streamingItems)) {
                    this._.forEach(streamingItems, (item) => {
                        if (!!item) {
                            this.$store.commit('addStreamingURL', item);
                            EventBus.$emit('openStreamURL', gadgetId);
                        }
                    });
                }
            });
        },
        closeStreaming(gadgetId) {
            this.services.closeStreaming([gadgetId], (streamingUrlList) => {
                if (!this._.isEmpty(streamingUrlList)) {
                    this._.forEach(streamingUrlList, (url) => {
                        this.$store.commit('removeStreamingURL', gadgetId);
                    });
                }
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
        _subscribe() {
            this.services.subscribe({
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
                }
            }, () => {});
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
