<template>
    <div class="left-group-item-panel">
        <div class="left-group-item-wrapper">
            <label class="left-group-item-label">
                <input type="checkbox" class="left-group-item-checkbox"
                v-model="checked" :disabled="disabled"
                @change="handleSelectedCheckbox">
                <div class="left-group-item-text" :title="getItemName">{{ getItemName }}</div>
            </label>
        </div>
        <div v-if="isOnairMe" class="left-group-onair-container">
            <div class="left-group-onair-image"></div>
        </div>
    </div>
</template>
<script>
import { EventBus } from '@/main.js';
export default {
    name: 'GroupItem',
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            group: {},
            checked: false,
            disabled: false,
            onAir: false,
            isMe: false
        }
    },
    computed: {
        getItemName() {
            return `${ this.group.name }`;
        },
        isOnairMe() {
            return this.isMe;
        }
    },
    methods: {
        handleSelectedCheckbox() {
            this.$emit('select-checkbox', this.group.id, this.checked);
        },
    },
    created() {
        this.group = this.$store.getters.getGroup(this.id);
        EventBus.$on('g-close-infowindow', (v) => {
            if (!this.onAir) {
                this.disabled = false;
                this.checked = false;
            }
        })
        EventBus.$on('g-open-infowindow', (v) => {
            if (!this.onAir) {
                this.disabled = true;
            }
        })
        EventBus.$on('g-close-reserve-infowindow', (v) => {
            if (!this.onAir) {
                this.disabled = false;
                this.checked = false;
            }
        })
        EventBus.$on('g-open-reserve-infowindow', (v) => {
            if (!this.onAir) {
                this.disabled = true;
            }
        })
        EventBus.$on('g-streaming-status', (v) => {
            if (v.groupIdList.indexOf(this.id) >= 0) {
                this.isMe = v.status;
            }
            if (v.status) {
                this.disabled = true;
                this.onAir = true;
            } else {
                this.disabled = false;
                this.checked = false;
                this.onAir = false;
                this.isMe = false;
            }
        })
        EventBus.$on('g-grouping-fire', (v) => {
            this.disabled = true;
        })
        EventBus.$on('g-grouping-finish', (v, info) => {
            this.disabled = false;
            this.checked = false;
        })
    },
    watch: {
    }
}
</script>
<style>
.left-group-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
}
.left-group-item-wrapper {
    transform: translateY(-25%);
}
.left-group-item-label {
    width: 100%;
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.left-group-item-checkbox {
    margin: -1px 10px 0 !important;
    width: 17px;
    height: 17px;
}
.left-group-item-text {
    display: inline-block;
    vertical-align: middle;
    width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.left-group-onair-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    width: 24px;
    height: 24px;
    cursor: pointer;
}
.left-group-onair-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/onair-group-speaker.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
</style>
