<template>
    <div id="sound-item" class="reserve-sound-item-panel">
        <div class="reserve-sound-item-wrapper">
            <label class="reserve-sound-item-label">
                <input type="radio" class="reserve-sound-item-checkbox"
                :value='getItemId' v-bind:checked="checked"
                v-model="picked"
                @change="handleSelectedCheckbox">
                <div class="reserve-sound-item-text" :title="getItemName">{{ getItemName }}</div>
            </label>
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
            picked: ''
        }
    },
    computed: {
        getItemName() {
            return `${ this.alarm.name }`;
        },
        getItemId() {
            return `${ this.id }`;
        },

    },
    methods: {
        handleSelectedCheckbox() {
            this.$emit('select-radio-button', this.id);
            this.checked = true;
            EventBus.$emit('g-reserve-sound-item-select', this.id);
        }
    },
    created() {
        this.alarm = this.$store.getters.getAlarmData(this.id);
        EventBus.$on('g-reserve-sound-item-select', (selectedSoundItemId) => {
            if (selectedSoundItemId != this.id) {
                this.checked = false;
                this.picked = '';
            }
        })
    },
    watch: {
    }
}
</script>
<style>
.reserve-sound-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
}
.reserve-sound-item-wrapper {
    transform: translateY(-25%);
}
.reserve-sound-item-label {
    width: 100%;
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.reserve-sound-item-checkbox {
    margin: -1px 10px 0 !important;
    width: 17px;
    height: 17px;
}
.reserve-sound-item-text {
    display: inline-block;
    vertical-align: middle;
    width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>