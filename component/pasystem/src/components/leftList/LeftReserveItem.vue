<template>
    <div id="reserve-item" class="left-reserve-item-panel" :class="{ deactive: deactive, selected:selected }" @click="handleSelectedItem">
        <div class="left-reserve-item-wrapper">
            <label class="left-reserve-item-label">
                {{ getItemName }}
            </label>
        </div>
        <div class="left-reserve-repeat-button">
            <div class="left-reserve-repeat-image" :class="{ nonRepeat: isRepeat }"></div>
        </div>
    </div>
</template>
<script>
import { EventBus } from '@/main.js';
export default {
    name: 'ReserveItem',
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            reserve: {},
            alarm: {},
            checked: false,
            disabled: false
        }
    },
    computed: {
        getItemName() {
            return `${ this.reserve.name }`;
        },
        getItemId() {
            return `${ this.id }`;
        },
        deactive() {
            return this.disabled;
        },
        selected() {
            return this.checked;
        },
        isRepeat() {
            if (this.reserve.repeat === 0) {
                return true;
            } else {
                return false;
            }
        }

    },
    methods: {
        handleSelectedItem() {
            this.$emit('select-item', this.id);
            this.checked = true;
            EventBus.$emit('g-reserve-item-select', this.id);
        },
    },
    created() {
        this.reserve = this.$store.getters.getReserveAlarmData(this.id);
        this.alarm = this.$store.getters.getAlarmData(this.reserve.alarm_id);
        EventBus.$on('g-close-infowindow', (v) => {
            this.disabled = false;
            this.checked = false;
        })
        EventBus.$on('g-open-infowindow', (v) => {
            this.disabled = true;
            this.checked = false;
        })
        EventBus.$on('g-close-reserve-infowindow', (v) => {
            this.disabled = false;
            this.checked = false;
        })
        EventBus.$on('g-open-reserve-infowindow', (v) => {
            this.disabled = true;
            this.checked = false;
        })
        EventBus.$on('g-reserve-item-select', (v) => {
            if (v !== this.id) {
                this.checked = false;
            }
        })
    },
    watch: {
    }
}
</script>
<style>
.left-reserve-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
    cursor: pointer;
}
.left-reserve-item-panel.deactive {
    pointer-events: none;
    background-color: rgb(224, 224, 224);
    color: rgb(177, 177, 177);
}
.left-reserve-item-panel.selected {
    background-color: rgb(48, 124, 124);
}
.left-reserve-item-wrapper {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}
.left-reserve-item-label {
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.left-reserve-repeat-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    width: 16px;
    height: 16px;
    opacity: 0.6;
    cursor: default;
}
.left-reserve-repeat-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/repeat.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
.left-reserve-repeat-image.nonRepeat {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/non-repeat.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
</style>