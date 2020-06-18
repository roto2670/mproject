<template>
    <div id="workEquipmentListItem" class="work-equipment-list-item-container">
        <div class="work-equipment-list-item-text-container">
            <div class="work-equipment-list-name"> {{ getName }}.</div>
            <div class="work-equipment-list-department"> {{ getDepartment }}</div>
        </div>
    </div>

</template>
<script>
export default {
    name: 'WorkEquipmentListItem',
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
            equipementInfo: null
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
            return this.equipmentInfo.name;
        },
        getDepartment() {
            return this.equipmentInfo.department;
        },
    },
    created() {
        this.equipmentInfo = this.$store.getters.getEquipment(this.info.equipment_id);
    }
}
</script>
<style>
.work-equipment-list-item-container {
    width: 100%;
    height: 2.0em;
    background-color: #ffffff;
    cursor: pointer;
    border-bottom: 1px solid #dddddd;
    padding-top: 4px;
    color: #1b94e2;
    font-weight: bold;
    font-size: 1em;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
}
.work-equipment-list-item-text-container {
    width: 100%;
    padding-top: 0.1em;
}
.work-equipment-list-name {
    display: inline-block;
    width: 50%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.work-equipment-list-department {
    display: inline-block;
    width: 50%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
</style>