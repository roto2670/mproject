<template>
    <div id="workEquipmentListItem" class="work-equipment-list-item-container">
        <div class="work-equipment-list-item-text-container">
            <div class="work-equipment-list-category"> {{ getCategory }}</div>
            <div class="work-equipment-list-name"> {{ getName }}</div>
            <div class="work-equipment-list-operator"> {{ getOperator }}</div>
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
            category: null,
            equipementInfo: null,
            operatorInfo: null
        }
    },
    methods: {
    },
    computed: {
        getCategory() {
            if (this.equipmentInfo) {
                return window.CONSTANTS.EQUIPMENT_INFO[this.equipmentInfo.category];
            } else {
                return null;
            }
        },
        getName() {
            if (this.equipmentInfo) {
                return this.equipmentInfo.name;
            } else {
                return null;
            }
        },
        getOperator() {
            if (this.operatorInfo) {
                return this.operatorInfo.name;
            } else {
                return null;
            }
        },
    },
    created() {
        this.equipmentInfo = this.$store.getters.getEquipment(this.info.equipment_id);
        this.operatorInfo = this.$store.getters.getOperator(this.info.operator_id);
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
.work-equipment-list-category {
    display: inline-block;
    width: 30%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: 0.7em;
}
.work-equipment-list-name {
    display: inline-block;
    width: 30%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.work-equipment-list-operator {
    display: inline-block;
    width: 40%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
</style>