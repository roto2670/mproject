<template>
    <div id="reservetimeitem" class="reserve-time-item-container">
        <div class="reserve-time-select-text"> {{ text }} </div>
        <select class="reserve-time-select-panel" :size="size" @change="handleChange" :disabled="isDisalbed"
        v-model="time">
            <option v-for="item in range" :value="item" :key="item" :disabled="isBlasting(item - 1)">{{ getItem(item - 1) }}</option>
        </select>
    </div>
</template>
<script>
import { EventBus } from '@/main.js';
export default {
    name: 'ReserveTimeItem',
    props: {
        type: {
            type: String
        }
    },
    data() {
        return {
            range: 0,
            time: 1,
            size: 1,
            disabled: false
        }
    },
    methods: {
        handleChange(v) {
            this.$emit('change-time', this.type, this.time-1);
            if (this.type == 'type') {
                EventBus.$emit('g-select-blasting-type', this.time-1);
            }
        },
        getItem(item) {
            if (this.type === 'type') {
                if (item === 0) {
                    return 'Normal';
                } else {
                    return 'Blasting'
                }
            } else if (this.type === 'repeat') {
                if (item === 0) {
                    return 'Normal';
                } else {
                    return 'Repeat'
                }
            }
            return item;
        },
        isBlasting(item) {
            return this.type == 'type' && ( item == 1)
        },
    },
    computed: {
        text() {
            let text = '';
            if (this.type === 'hour') {
                text = 'HOUR';
            } else if (this.type === 'minute') {
                text = 'MINUTE';
            } else if (this.type === 'type') {
                text = 'ALARM TYPE';
            } else if (this.type === 'repeat') {
                text = 'REPEAT';
            }
            return text;
        },
        isDisalbed() {
            return this.type == "repeat" && this.disabled;
        },
    },
    created() {
        if (this.type === 'hour') {
            this.range = 24;
        } else if (this.type === 'minute') {
            this.range = 60;
        } else if (this.type === 'repeat') {
            this.range = 2;
        } else {
            this.range = 2;
        }
        EventBus.$on('g-select-blasting-type', (v) => {
            if (this.type == 'repeat') {
                if (v == 0) {
                    this.disabled = false;
                } else {
                    this.disabled = true;
                }
            }
        })
    }
}
</script>
<style>
.reserve-time-item-container {
    position: relative;
    width: 100%;
    height: 45px;
    border-bottom: 1px solid rgb(223, 223, 233);
}
.reserve-time-select-text {
    position: absolute;
    left: 20px;
    top: 50%;
    font-weight: bold;
    color: rgb(128, 128, 128);
    transform: translateY(-50%);
}
.reserve-time-select-panel {
    position: absolute;
    right: 15px;
    top: 50%;
    font-size: 12px;
    transform: translateY(-50%);
}
</style>
