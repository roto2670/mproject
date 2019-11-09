<template>
    <div id="reservetimelist" class="time-container">
        <div class="time-frame">
            <div class="remain-container"></div>
            <ReserveTimeItem v-for="(type, index) in types"
            :key="index" :type="type" @change-time="handleSelectTime"></ReserveTimeItem>
        </div>
        <div class="group-button-frame"
        @click="handleSelectButton">
            <div class="group-button-panel">
                <div class="group-button-text">FINISH</div>
            </div>
        </div>
    </div>
</template>
<script>
import ReserveTimeItem from '@/components/topList/ReserveTimeItem';
export default {
    name: 'ReserveTimeList',
    components: {
        ReserveTimeItem
    },
    data() {
        return {
            types: ['hour', 'minute', 'type'],
            data: {
                hour: 0,
                minute: 0,
                type: 1
            }
        }
    },
    methods: {
        handleSelectTime(type, time) {
            this.data[type] = time;
        },
        handleSelectButton() {
            this.$emit('finish', this.data);
        }
    }
}
</script>
<style>
.time-container {
    position: absolute;
    width: 300px;
    height: auto;
    background-color: rgb(249, 249, 249);
    border: 1px solid rgb(223, 223, 233);
    z-index: 1;
    left: 490px;
    border-radius: 10px;
    z-index: 1;
    box-shadow: 0.25em 0.25em 0.75em rgba(0, 0, 0, .1);
    overflow: hidden;
}
.time-frame {
    max-height: 350px;
    overflow-y: scroll;
}
.time-wrapper {

}
</style>