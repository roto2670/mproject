<template>
    <div id="reserve-item" class="left-reserve-item-panel" :class="{ deactive: deactive, selected:selected }">
        <div class="left-reserve-item-wrapper" @click="handleSelectedItem">
            <label class="left-reserve-item-label">
                <div class="left-reserve-item-text" :title="getItemName">{{ getItemName }}</div>
            </label>
        </div>
        <div class="left-reserve-switch-button">
            <div class="left-reserve-switch-on-image" :class="{ off: isPause }"
                @click="handleSwitch"></div>
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
            disabled: false,
            pause: false,
            onAir: false
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
        },
        isPause() {
            return this.pause;
        }

    },
    methods: {
        handleSelectedItem() {
            this.$emit('select-item', this.id);
            this.checked = true;
            EventBus.$emit('g-reserve-item-select', this.id);
        },
        handleSwitch() {
            let isPause = !this.reserve.pause;
            this.$emit('select-pause', this.id, isPause);
        }
    },
    created() {
        this.reserve = this.$store.getters.getReserveAlarmData(this.id);
        this.alarm = this.$store.getters.getAlarmData(this.reserve.alarm_id);
        if (this.reserve.pause === 0) {
            this.pause = false;
        } else {
            this.pause = true;
        }
        EventBus.$on('g-close-infowindow', (v) => {
            if (!this.onAir) {
                this.disabled = false;
                this.checked = false;
            }
        })
        EventBus.$on('g-open-infowindow', (v) => {
            if (!this.onAir) {
                this.disabled = true;
                this.checked = false;
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
                this.checked = false;
            }
        })
        EventBus.$on('g-reserve-item-select', (v) => {
            if (v !== this.id) {
                this.checked = false;
            }
        })
        EventBus.$on('g-reserve-item-pause', (v) => {
            if (this.id === v.id) {
                this.reserve = v;
                if (this.reserve.pause === 0) {
                    this.pause = false;
                } else {
                    this.pause = true;
                }
            }
        })
        EventBus.$on('g-streaming-status', (v) => {
            if (v.status) {
                this.disabled = true;
                this.onAir = true;
            } else {
                this.disabled = false;
                this.onAir = false;
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
    transform: translateY(-25%);
}
.left-reserve-item-label {
    width: 100%;
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.left-reserve-item-text {
    display: inline-block;
    width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
.left-reserve-switch-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 40px;
    width: 30px;
    height: 30px;
    opacity: 0.6;
    cursor: default;
}
.left-reserve-switch-on-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/switch-on.svg');
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
}
.left-reserve-switch-on-image.off {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/switch-off.svg');
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
}
</style>