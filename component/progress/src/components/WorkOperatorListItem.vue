<template>
    <div id="workOperatorListItem" class="work-operator-list-item-container">
        <div class="work-operator-list-item-text-container">
            <div class="work-operator-list-name"> {{ getName }}.</div>
            <div class="work-operator-list-department"> {{ getDepartment }}</div>
        </div>
    </div>

</template>
<script>
export default {
    name: 'WorkOperatorListItem',
    components: {
    },
    props: {
        id: {
            type: Number
        },
        info: {
            type: Object
        }
    },
    data() {
        return {
            operatorInfo: null
        }
    },
    methods: {
    },
    computed: {
        getAccumTime() {
            // let tmpTime = new Date(0),
            //     tmpStr = '';
            // tmpTime.setSeconds(this.pauseInfo.accum_time);
            // tmpStr = tmpTime.toISOString().substr(11,8).split(":");
            // return tmpStr[0] + "H " + tmpStr[1] + "M " + tmpStr[2] + "S";
            // tmpStr = tmpTime.toISOString().substr(11,8);
            // return tmpStr;
            return '';
        },
        getName() {
            return this.operatorInfo.name;
        },
        getDepartment() {
            return this.operatorInfo.department;
        },
    },
    created() {
        this.operatorInfo = this.$store.getters.getOperator(this.info.operator_id);
    }
}
</script>
<style>
.work-operator-list-item-container {
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
.work-operator-list-item-text-container {
    width: 100%;
    padding-top: 0.1em;
}
.work-operator-list-name {
    display: inline-block;
    width: 50%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.work-operator-list-department {
    display: inline-block;
    width: 50%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
</style>