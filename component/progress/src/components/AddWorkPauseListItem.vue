<template>
    <div v-if="isOpen" id="addWorkEquipmentListItem" class="add-work-equipment-list-item-container">
        <div class="add-work-equipment-background"></div>
        <div class="add-work-equipment-selectbox">
            <div class="add-work-equipment-title-container">
                <div class="add-work-equipment-title-message">
                    Please select the reason
                </div>
            </div>
            <div class="add-work-equipment-select-container">
                <select class="add-work-equipment-select-box"
                    @change="handleChangeReason">
                    <option disabled selected>Please select the reason</option>
                    <option v-for="message in messageList" :value="message.message" :key="message.message">
                        {{ message.message }}
                    </option>
                </select>
                <input id="pauseStartDate" type="date" class="add-work-equipment-date"
                    @change="handleChangPauseStartDate" />
                <input id="pauseStartTime" type="time" class="add-work-equipment-date"
                    @change="handleChangePauseStartTime"/>
                <input id="pauseFinishDate" type="date" class="add-work-equipment-date"
                    @change="handleChangePauseFinishDate" />
                <input id="pauseFinishTime" type="time" class="add-work-equipment-date"
                    @change="handleChangePauseFinishTime" />
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
            selectedCategory: '',
            startTime: null,
            finishTime: null,
            startTimestamp: null,
            finishTimestamp: null,
            startDate: null,
            finishDate: null,
            totalDuration: null,
            messageList: this.$store.getters.getMessageList()
        }
    },
    methods: {
        _handleClear() {
            this.selectedCategory = '';
            this.startTime = null,
            this.finishTime = null,
            this.startTimestamp = null,
            this.finishTimestamp = null,
            this.startDate = null,
            this.finishDate = null,
            this.totalDuration = null
        },
        handleChangeReason(e) {
            this.selectedCategory = e.target.value;
        },
        handleChangePauseStartTime (e) {
            this.startTime = e.target.value
            this.startTimestamp = new Date(this.startDate + "T" + this.startTime).getTime()/1000
        },
        handleChangPauseStartDate (e) {
            this.startDate = e.target.value
            this.startTimestamp = new Date(this.startDate + "T" + this.startTime).getTime()/1000
        },
        handleChangePauseFinishTime (e) {
            this.finishTime = e.target.value
            this.finishTimestamp = new Date(this.finishDate + "T" + this.finishTime).getTime()/1000
        },
        handleChangePauseFinishDate (e) {
            this.finishDate = e.target.value
            this.finishTimestamp = new Date(this.finishDate + "T" + this.finishTime).getTime()/1000
        },
        handleAddButton() {
            let data = {};
            data.start_time = this.startTimestamp;
            data.end_time = this.finishTimestamp;
            data.accum_time = this.finishTimestamp - this.startTimestamp;
            data.message = this.selectedCategory;
            this.$emit('select-add-button', data);
            this._handleClear();
        },
        handleCancleButton() {
            this.$emit('select-cancel-button', {});
            this._handleClear();
        }
    },
    computed: {
        getEquipList() {
            let filterEquipList = [];
            if (this.selectedCategory != '') {
                this._.forEach(this.equipmentList, equipment => {
                    if (equipment.category == this.selectedCategory) {
                        filterEquipList.push(equipment);
                    }
                });
            }
            return filterEquipList;
        },
        getOperatorList() {
            let filterOperatorList = [];
            if (this.selectedCategory != '') {
                this._.forEach(this.operatorList, operator => {
                    if (operator.category == this.selectedCategory) {
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
    opacity: 0.4;
    background-color: #000000;
}
.add-work-equipment-selectbox {
    width: 400px;
    height: 400px;
    position: absolute;
    background-color: #ffffff;
    top: 30%;
    left: 30%;
    text-align: center;
    border-radius: 4px;
}
.add-work-equipment-title-container {
    width: 100%;
    height: 20%;
}
.add-work-equipment-title-message {
    width: 100%;
    font-size: 1.8em;
    padding: 0.5em 0.1em 0.5em 0.1em;
    color: #595959;
    font-size: 1.475em;
    font-weight: 600;
    text-align: center;
    text-transform: none;
}
.add-work-equipment-select-container {
    width: 100%;
    height: 60%;
}
.add-work-equipment-select-box {
    width: 75%;
    padding: .375em .625em;
    margin: 0.5em;
    background: inherit;
    color: #595959;
    font-size: 1.0em;
}
.add-work-equipment-date {
    width: 70%;
    padding: .375em .625em;
    margin: 0.5em;
    color: #595959;
    font-size: 1.0em;
}
.add-work-equipment-button-container {
    width: 100%;
    height: 25%;
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
    padding: 0.2em;
    margin: 0.4em;
}
.add-work-equipment-button.add {
    background-color: #3085d6;
}
.add-work-equipment-button.cancel {
    background-color: #aaa;
}
</style>