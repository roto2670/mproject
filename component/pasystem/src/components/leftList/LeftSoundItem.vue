<template>
    <div id="sound-item" class="left-sound-item-panel">
        <div class="left-sound-item-wrapper">
            <label class="left-sound-item-label">
                <input type="radio" class="left-sound-item-checkbox" :id='getItemId'
                :value='getItemId' :checked="checked"
                v-model="checked" :disabled="disabled"
                @click="handleSelectedCheckbox">{{ getItemName }}
            </label>
        </div>
        <div v-if="isShowingEditButton" class="left-sound-remove-button"
        @click="handleRemoveButton">
            <div class="left-sound-remove-image"></div>
        </div>
    </div>
</template>
<script>
import { EventBus } from '@/main.js';
export default {
    name: 'SoundItem',
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            alarm: {},
            checked: false,
            disabled: false
        }
    },
    computed: {
        getItemName() {
            return `${ this.alarm.name }`;
        },
        getItemId() {
            return `${ this.id }`;
        },
        isShowingEditButton() {
            return !this.checked && !this.disabled;
        },

    },
    methods: {
        handleSelectedCheckbox() {
            this.checked = !this.checked;
            this.$emit('select-radio-button', this.id, this.checked);
            EventBus.$emit('g-sound-item-select', this.id);
        },
        handleRemoveButton() {
            const data = [this.id];
            this.services.removePlayList(data, (ret) => {
                // console.log("Remove playlist ret. ", ret);
            }, (error) => {
                console.warn("Failed to remove playlist.", error);
            })
        },
    },
    created() {
        this.alarm = this.$store.getters.getAlarmData(this.id);
        EventBus.$on('g-close-infowindow', (v) => {
            this.disabled = false;
            this.checked = false;
        })
        EventBus.$on('g-open-infowindow', (v) => {
            this.disabled = true;
        })
        EventBus.$on('g-sound-item-select', (selectedSoundItemId) => {
            if (selectedSoundItemId != this.id) {
                this.checked = false;
            }
        })
        EventBus.$on('g-close-reserve-infowindow', (v) => {
            this.disabled = false;
            this.checked = false;
        })
        EventBus.$on('g-open-reserve-infowindow', (v) => {
            this.disabled = true;
        })
    },
    watch: {
    }
}
</script>
<style>
.left-sound-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
}
.left-sound-item-wrapper {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}
.left-sound-item-label {
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.left-sound-item-checkbox {
    margin: -1px 10px 0 !important;
    width: 17px;
    height: 17px;
    vertical-align: middle;
}
.left-sound-remove-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    width: 24px;
    height: 24px;
    cursor: pointer;
}
.left-sound-remove-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/list-remove.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
</style>