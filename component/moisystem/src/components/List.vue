<template>
    <div id="list" class="list-main-container">
        <div class="list-main-frame">
            <div class="list-top-frame">
                <div class="list-text">{{ title }}</div>
                <!-- <div @click="handleCloseButton" class="list-button">
                    <CloseIcon color="white"/>
                </div> -->
                <div @click="handleSelectAllData" class="select-button">
                    <SelectIcon :selectAll="selectedAllData"/>
                </div>
            </div>
            <div class="list-content-frame">
                <!-- <draggable
                    :list="ipcams"
                    :disabled="!enabled"
                    class="list-group"
                    ghost-class="ghost"
                    :move="checkMove"
                    @start="dragging = true"
                    @end="dragging = false"
                > -->
                <list-item v-for="ipcam in ipcams" :key="ipcam.name"
                :ipcam="ipcam" :checked="isSelected(ipcam.id)"
                :selectedIpcamId="selectedId"
                @select-item="handleSelectedItem"/>
                <!-- </draggable> -->
            </div>
        </div>
    </div>
</template>
<script>
import ListItem from '@/components/ListItem'
import CloseIcon from '@/components/icons/CloseIcon'
import SelectIcon from '@/components/icons/SelectIcon'
import draggable from 'vuedraggable';
import { EventBus } from '@/main.js';
export default {
    name: 'List',
    components: {
        ListItem,
        CloseIcon,
        SelectIcon,
        draggable
    },
    props: {
        selectedList: {
            type: Array
        },
        ipcams: {
            type: Array
        }
    },
    data() {
        return {
            title: 'Selected videos',
            selectedId: '',
            onTimeoutData: null,
            selectedAllData: false,
            enabled: true,
            dragging: false
        }
    },
    methods: {
        handleSelectedItem(id) {
            if (this._.size(this.selectedList) >= window.CONSTANTS.MAX_SHOWING_SCREEN &&
                !this._.includes(this.selectedList, id)) {
                this.sweetbox.fire('max ipcam streaming');
            } else {
                this.$emit('select-item', id);
                this.startLoadingTimeout();
                this.selectedId = id;
            }
        },
        handleCloseButton() {
            this.$emit('select-close-all-list');
        },
        handleSelectAllData() {
            this.selectedAllData = !this.selectedAllData;
            this.handleSelectAll();
        },
        handleSelectAll() {
            if (this.selectedAllData) {
                let list = [];
                const size = 9 - this.selectedList.length;
                this._.forEach(this.ipcams, (data) => {
                    if (!this._.includes(this.selectedList, data.id)) {
                        if (data.status && data.custom.is_visible_moi) {
                            list.push(data.id);
                        }
                    }
                    
                    if (list.length >= size) return false;
                });
                this.$emit('select-all', list);
            } else {
                this.$emit('select-close-all-list', true);
            }
        },
        isSelected(id) {
            return this._.includes(this.selectedList, id);
        },
        startLoadingTimeout() {
            if (!!!this.onTimeoutData) {
                this.onTimeoutData = setTimeout(() => {
                    this.selectedId = '';
                    this.onTimeoutData = null; 
                }, window.CONSTANTS.TIMEOUT_SEC);
            }
        },
        stopLoadingTimeout() {
            if (!!this.onTimeoutData) {
                clearTimeout(this.onTimeoutData);
                this.onTimeoutData = null;
            }
        }
    },
    created() {
        console.log("Create list view ", this.ipcams);
    },
    watch: {
        selectedList: function() {
            this.selectedId = '';
            this.stopLoadingTimeout();
            this.selectedAllData = this.selectedList.length === window.CONSTANTS.MAX_SHOWING_SCREEN;
        }
    }
}
</script>
<style>
.list-main-container {
    position: absolute;
    width: 100%;
    height: 100%;
}
.list-main-frame {
    width: 250px;
    height: 100%;
    position: absolute;
    /* top: 1em; */
    /* left: 1em; */
    /* border-radius: 15px; */
    overflow: hidden;
}
.list-top-frame {
    position: relative;
    width: 100%;
    height: 3em;
    background-color: rgb(25, 195, 180);
}
.list-text {
    position: absolute;
    left: 1em;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-weight: bold;
    font-size: 1.4em;
    letter-spacing: .4px;
}
.list-button {
    position: absolute;
    width: .7em;
    height: .7em;
    top: 40%;
    transform: translateY(-50%);
    right: 1em;
}
.list-content-frame {
    position: relative;
    width: 100%;
    height: calc(100% - 2.5em);
    overflow-x: hidden;
    overflow-y: scroll;
    background: white;
}
.select-button {
    position: absolute;
    width: 1.3em;
    height: 1.3em;
    top: 48%;
    transform: translateY(-50%);
    right: 2.5em;
    cursor: pointer;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>