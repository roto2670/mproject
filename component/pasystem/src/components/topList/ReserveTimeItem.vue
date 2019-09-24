<template>
    <div id="reservetimeitem" class="time-item-container">
        <div class="time-select-text"> {{ text }} </div>
        <select class="time-select-panel" :size="size" @change="handleChange" v-model="time">
            <option v-for="item in range" :value="item" :key="item">{{ getItem(item - 1) }}</option>
        </select>
    </div>
</template>
<script>
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
            size: 1
        }
    },
    methods: {
        handleChange() {
            this.$emit('change-time', this.type, this.time);
        },
        getItem(item) {
            if (this.type === 'type') {
                if (item === 0) {
                    return 'Normal';
                } else {
                    return 'Blasting'
                }
            }
            return item;
        }
    },
    computed: {
        text() {
            let text = '';
            if (this.type === 'hour') {
                text = 'SELECT A HOUR';
            } else if (this.type === 'minute') {
                text = 'SELECT A MINUTE';
            } else if (this.type === 'type') {
                text = 'SELECT A ALARM TYPE';
            }
            return text;
        }
    },
    created() {
        if (this.type === 'hour') {
            this.range = 24;
        } else if (this.type === 'minute') {
            this.range = 60;
        } else {
            this.range = 2;
            this.size = 2;
        }
    }
}
</script>
<style>
.time-item-container {
    position: relative;
    width: 100%;
    height: 50px;
    border-bottom: 1px solid rgb(223, 223, 233);
}
.time-select-text {
    position: absolute;
    left: 20px;
    top: 50%;
    font-weight: bold;
    transform: translateY(-50%);
}
.time-select-panel {
    position: absolute;
        right: 20px;
    top: 50%;
    transform: translateY(-50%);
}
</style>
