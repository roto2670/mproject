<template>
    <div id="workListItem" class="work-list-item-container">
        <div class="work-list-item-text-container"
            @click="handleSelectMenu">
            {{ isDone }} {{ getWorkType }} ({{ getAccumTime }})
        </div>
    </div>

</template>
<script>
export default {
    name: 'WorkListItem',
    components: {
    },
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            workInfo: null
        }
    },
    methods: {
        handleSelectMenu() {
            this.$emit('select-item', this.id);
        }
    },
    computed: {
        getWorkType() {
            return window.CONSTANTS.WORK_NAME[this.workInfo.typ];
        },
        getAccumTime() {
            let tmpTime = new Date(0),
                tmpStr = '';
            tmpTime.setSeconds(this.workInfo.accum_time);
            // tmpStr = tmpTime.toISOString().substr(11,8).split(":");
            // return tmpStr[0] + "H " + tmpStr[1] + "M " + tmpStr[2] + "S";
            // OLD format
            // return tmpTime.toISOString().substr(11,8);
            let tList = tmpTime.toISOString().substr(9,7).split('T');
            let day = parseInt(tList[0]) - 1;
            let tStr = tList[1].split(":");
            let h = tStr[0] + 'H';
            let m = tStr[1] + "M";
            return day + "D" + " " + h + " " + m;
        },
        isDone() {
            if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                return "(D)";
            } else {
                return "";
            }
        },
    },
    created() {
        this.workInfo = this.$store.getters.getWork(this.id);
    }
}
</script>
<style>
.work-list-item-container {
    width: 100%;
    height: 2.0em;
    background-color: #ffffff;
    cursor: pointer;
    border-bottom: 1px solid #dddddd;
    padding-top: 4px;
    color: #1b94e2;
    font-weight: bold;
    font-size: 0.9em;
}
.work-list-item-text-container {
    width: 100%;
    padding-top: 0.1em;
}
</style>