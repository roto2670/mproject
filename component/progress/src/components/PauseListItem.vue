<template>
    <div id="pauseListItem" class="pause-list-item-container">
        <div class="pause-list-item-text-container" :title="getMessage">
            <div class="pause-list-rank"> {{ getRank }}.</div>
            <div class="pause-list-accum"> {{ getAccumTime }}</div>
            <div class="pause-list-message"> {{ getMessage }}</div>
        </div>
    </div>

</template>
<script>
export default {
    name: 'PauseListItem',
    components: {
    },
    props: {
        id: {
            type: Number
        },
        rank: {
            type: Number
        }
    },
    data() {
        return {
            pauseInfo: null
        }
    },
    methods: {
    },
    computed: {
        getRank() {
            return this.rank + 1;
        },
        getAccumTime() {
            let tmpTime = new Date(0),
                tmpStr = '';
            tmpTime.setSeconds(this.pauseInfo.accum_time);
            // tmpStr = tmpTime.toISOString().substr(11,8).split(":");
            // return tmpStr[0] + "H " + tmpStr[1] + "M " + tmpStr[2] + "S";
            tmpStr = tmpTime.toISOString().substr(11,8);
            return tmpStr;
        },
        getMessage() {
            return this.pauseInfo.message;
        },
        getAccum() {
            return this.pauseInfo.accum_time;
        },
    },
    created() {
        this.pauseInfo = this.$store.getters.getPause(this.id);
    }
}
</script>
<style>
.pause-list-item-container {
    width: 100%;
    height: 2.0em;
    background-color: #ffffff;
    cursor: pointer;
    border-bottom: 1px solid #dddddd;
    padding-top: 4px;
    color: #1b94e2;
    font-weight: bold;
    font-size: 1em;
}
.pause-list-item-text-container {
    width: 100%;
    padding-top: 0.1em;
}
.pause-list-rank {
    display: inline-block;
    width: 5%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.pause-list-accum {
    display: inline-block;
    width: 25%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.pause-list-message {
    display: inline-block;
    width: 65%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: left;
}
</style>