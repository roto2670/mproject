<template>
    <div v-if="isOpen" id="addWorkEquipmentListItem" class="add-work-equipment-list-item-container">
        <div class="add-work-equipment-background"></div>
        <div class="add-work-equipment-selectbox">
            <div class="add-work-equipment-title-container">
                <div class="add-work-equipment-title-message">
                    Select Equipment and Operator
                </div>
            </div>
            <div class="add-work-equipment-select-container">
                <select class="add-work-equipment-select-box"
                    @change="handleChangeEquipment">
                    <option disabled selected> - Select Equipment - </option>
                    <option v-for="value in equipmentList" :value="value.id" :key="value.id">
                        {{ value.name }}
                    </option>
                </select>
                <select class="add-work-equipment-select-box"
                    @change="handleChangeOperator">
                    <option disabled selected> - Select Operator - </option>
                    <option v-for="value in getOperatorList" :value="value.id" :key="value.id">
                        {{ value.name }}
                    </option>
                </select>
            </div>
            <div class="add-work-equipment-button-container">
                <div class="add-work-equipment-button add"
                    @click="handleAddButton">
                    Add
                </div>
                <div class="add-work-equipment-button cancel"
                    @click="handleCancleButton">
                    Cancel
                </div>
            </div>
        </div>
    </div>

</template>
<script>
export default {
    name: 'AddWorkEquipmentListItem',
    components: {
    },
    props: {
        isOpen: {
            type: Boolean,
            default: false
        },
        operatorList: {
            type: Array,
            default: []
        },
        equipmentList: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            selectEquipmentId: '',
            selectOperatorId: ''
        }
    },
    methods: {
        _handleClear() {
            this.selectEquipmentId = '';
            this.selectOperatorId = '';
        },
        handleChangeOperator(e) {
            this.selectOperatorId = e.target.value;
        },
        handleChangeEquipment(e) {
            this.selectEquipmentId = e.target.value;
        },
        handleAddButton() {
            if (this.selectEquipmentId != '' && this.selectOperatorId != '') {
                this.$emit('select-add-button', this.selectEquipmentId, this.selectOperatorId);
                this._handleClear();
            }
        },
        handleCancleButton() {
            this.$emit('select-cancel-button', {});
            this._handleClear();
        }
    },
    computed: {
        getOperatorList() {
            let filterOperatorList = [];
            if (this.selectEquipmentId != '') {
                let selectEquipment = this.$store.getters.getEquipment(this.selectEquipmentId);
                this._.forEach(this.operatorList, operator => {
                    if (operator.category == selectEquipment.category) {
                        filterOperatorList.push(operator);
                    }
                });
            }
            return filterOperatorList;
        }
    },
    created() {
    }
}
</script>
<style>
.add-work-equipment-list-item-container {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 10;
}
.add-work-equipment-background {
    width: 100%;
    height: 100%;
    position: absolute;
    opacity: 0.8;
    background-color: #000000;
}
.add-work-equipment-selectbox {
    width: 30%;
    height: 30%;
    position: absolute;
    background-color: #ffffff;
    top: 30%;
    left: 30%;
    text-align: center;
}
.add-work-equipment-title-container {
    width: 100%;
    height: 25%;
}
.add-work-equipment-title-message {
    width: 100%;
    font-size: 1.8em;
    padding: 0.5em 0.1em 0.5em 0.1em;
}
.add-work-equipment-select-container {
    width: 100%;
    height: 55%;
}
.add-work-equipment-select-box {
    min-width: 60%;
    max-width: 100%;
    padding: .375em .625em;
    margin: 0.5em;
    background: inherit;
    color: inherit;
    font-size: 1.125em;
}
.add-work-equipment-button-container {
    width: 100%;
    height: 20%;
}
.add-work-equipment-button {
    display: inline-block;
    border: 0;
    border-radius: .25em;
    background: initial;
    color: #fff;
    font-size: 1.0625em;
    cursor: pointer;
    width: 5em;
    height: 2em;
    padding: 0.5em;
    margin: 0.4em;
}
.add-work-equipment-button.add {
    background-color: #3085d6;
}
.add-work-equipment-button.cancel {
    background-color: #aaa;
}
</style>