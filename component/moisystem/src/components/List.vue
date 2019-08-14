<template>
    <div id="list" class="list-main-container">
        <div class="list-main-frame">
            <div class="list-top-frame">
                <div class="list-text">{{ title }}</div>
                <!-- <div @click="handleCloseButton" class="list-button">
                    <CloseIcon color="white"/>
                </div> -->
                <!-- <div @click="handleSelectAllData" class="select-button">
                    <SelectIcon :selectAll="selectedAllData"/>
                </div> -->
            </div>
            <div class="list-content-frame">
                <list-item v-for="ipcam in ipcams" :key="ipcam.id"
                :ipcam="ipcam" :checked="isSelected(ipcam.id)"
                :selectedIpcamId="selectedId"
                @select-item="handleSelectedItem"/>
            </div>
        </div>
    </div>
</template>
<script>
import ListItem from '@/components/ListItem'
import CloseIcon from '@/components/icons/CloseIcon'
import SelectIcon from '@/components/icons/SelectIcon'
export default {
    name: 'List',
    components: {
        ListItem,
        CloseIcon,
        SelectIcon
    },
    props: {
        selectedList: {
            type: Array
        }
    },
    data() {
        return {
            ipcams: [],
            title: 'Selected videos',
            selectedId: '',
            onTimeoutData: null,
            selectedAllData: false
        }
    },
    methods: {
        handleSelectedItem(id) {
            if (this._.size(this.selectedList) < window.CONSTANTS.MAX_SHOWING_SCREEN) {
                this.$emit('select-item', id);
                this.startLoadingTimeout();
                this.selectedId = id;
            } else {
                this.sweetbox.fire('max ipcam streaming');
            }
        },
        handleCloseButton() {
            this.$emit('select-close-all-list');
        },
        handleSelectAllData() {
            this.selectedAllData = !this.selectedAllData;
            this.handleSelectAll();
            return this.selectedAllData;
        },
        handleSelectAll() {
            if (this.handleSelectAllData) {
                let cnt = 0;
                this._.forEach(this.ipcams, (data) => {
                    if (cnt < 9) {
                        this.$emit('select-item', data.id);
                    }
                    cnt++;
                })
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
        },
        _sortIpcamStatus() {
            this.ipcams = this._.sortBy(this.ipcams, ['status']); 
            this.ipcams = this._.reverse(this.ipcams);
        }
    },
    created() {
        this.ipcams = this.$store.getters.getIpcams;
        this._sortIpcamStatus();
        console.log("Create list view ", this.ipcams);
    },
    watch: {
        selectedList: function() {
            this.selectedId = '';
            this.stopLoadingTimeout();
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
    right: 1em;
    cursor: pointer;
}
</style>