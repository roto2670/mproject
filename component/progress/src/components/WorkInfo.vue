<template>
    <div v-if="isType()">
        <div v-if="isEdit" id="workInfoEditor" class="work-info-container">
            <div class="work-info-title-container">
                ACTIVITY
            </div>
            <div class="work-info-body-container" :class="{ edit: isEdit }">
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Category</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getWorkCategory" maxlength="30" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Activity</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getWorkType" maxlength="30" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">State</div>
                    <input id="workState" type="text" class="work-info-body-content-message"
                        :value="getWorkState" maxlength="30" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Start Time</div>
                    <input id="workStartTime" type="datetime-local" class="work-info-body-content-message"
                        :value="getStartTime" @change="handleChangeWorkStartTime" />
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Finish Time</div>
                    <input id="workFinishTime" type="datetime-local" class="work-info-body-content-message"
                        :value="getFinishTime" @change="handleChangeWorkFinishTime" />
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Total Duration</div>
                    <input id="workStartTime" type="text" class="work-info-body-content-message"
                        :value="getTotalTime" readonly>
                </div>
            </div>
            <div class="work-info-button-container">
                <div class="work-info-ok-button"
                    @click="handleOkButton">
                OK
                </div>
                <div class="work-info-cancel-button"
                    @click="handleCancelButton">
                CANCEL
                </div>
            </div>
        </div>
        <div v-else id="workInfoEditor" class="work-info-container">
            <div class='panel-close-button' @click="handleCloseButton"></div>
            <div class="work-info-title-container">
                ACTIVITY
            </div>
            <div class="work-info-body-container">
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Category</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getWorkCategory" maxlength="30" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Activity</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getWorkType" maxlength="30" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">State</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getWorkState" maxlength="30" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Start Time</div>
                    <input type="datetime-local" class="work-info-body-content-message"
                        :value="getStartTime" @change="handleChangeWorkStartTime" readonly>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Finish Time</div>
                    <input type="datetime-local" class="work-info-body-content-message"
                        :value="getFinishTime" @change="handleChangeWorkFinishTime" readonly>
                </div>

                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Total Duration</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getTotalTime" readonly>
                </div>

                <div class="work-info-body-button-container">
                    <div class="work-info-body-button" :class="{ buttonDisabled: isStart , buttonFinishDisabled: isFinish }"
                        @click="handleStartWork">Start</div>
                    <div class="work-info-body-button" :class="{ buttonDisabled: !isStart, buttonFinishDisabled: isFinish }"
                        @click="handleStopWork">Pause</div>
                    <div class="work-info-body-button" :class="{ buttonDisabled: isFinish, buttonFinishDisabled: isFinish }"
                        @click="handleFinishWork">Finish</div>
                </div>
                <div class="work-info-body-button-container">
                    <div class="work-info-body-button" :class="{ buttonDisabled: isStart }"
                        @click="handleEditButton">Edit</div>
                    <div class="work-info-body-button" :class="{ buttonDisabled: isStart, buttonFinishDisabled: isFinish }"
                        @click="handleRemoveWork">Remove</div>
                </div>

                <div class="work-info-body-list-container">
                    <div class="work-info-body-list-title-container">
                        Pause ( {{ getPauseTotalTime }} )
                    </div>
                    <div class="work-info-body-sub-list-container">
                        <div class="work-info-content-list-container">
                            <div id="mainWorkList">
                                <PauseListItem v-for="(pause, i) in pauseList" :key="pause" :id="pause" :rank="i">
                                </PauseListItem>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="work-info-body-list-container">
                    <div class="work-info-body-list-title-container">
                        Operator List
                    </div>
                    <div class="work-info-body-sub-list-container">
                        <div class="work-info-content-list-container">
                            <div id="mainWorkList">
                                <WorkOperatorListItem v-for="workOperator in workOperatorList"
                                    :key="workOperator.id" :id="workOperator.id" :info="workOperator">
                                </WorkOperatorListItem>
                            </div>
                        </div>
                    </div>
                    <div class="work-info-body-list-button-container">
                        <div class="work-info-body-list-button-add" :class="{ buttonDisabled: isFinish }"
                            @click="handleAddOperatorButton">ADD Operator</div>
                    </div>
                </div>
                <div class="work-info-body-list-container">
                    <div class="work-info-body-list-title-container">
                        Equipment List
                    </div>
                    <div class="work-info-body-sub-list-container">
                        <div class="work-info-content-list-container">
                            <div id="mainWorkList">
                                <WorkEquipmentListItem v-for="workEquipment in workEquipmentList"
                                    :key="workEquipment.id" :id="workEquipment.id" :info="workEquipment">
                                </WorkEquipmentListItem>
                            </div>
                        </div>
                    </div>
                    <div class="work-info-body-list-button-container">
                        <div class="work-info-body-list-button-add" :class="{ buttonDisabled: isFinish }"
                            @click="handleAddEquipmentButton">ADD Equipment</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import PauseListItem from '@/components/PauseListItem';
import WorkOperatorListItem from '@/components/WorkOperatorListItem';
import WorkEquipmentListItem from '@/components/WorkEquipmentListItem';
export default {
    name: 'WorkInfo',
    components: {
        PauseListItem,
        WorkOperatorListItem,
        WorkEquipmentListItem,
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
        id: {
          type: String
        },
        blastId: {
          type: String
        },
        pauseList: {
            type: Array
        },
        operatorList: {
            type: Array
        },
        equipmentList: {
            type: Array
        },
        workOperatorList: {
            type: Array
        },
        workEquipmentList: {
            type: Array
        }
    },
    data() {
        return {
            isEdit: false,
            isStart : false,
            isFinish : false,
            startTime: null,
            finishTime: null,
            workInfo: null,
        }
    },
    methods: {
        isType() {
            if (this.type == window.CONSTANTS.TYPE.SELECT_WORK) {
                this.workInfo = this.$store.getters.getWork(this.id);
                this.setState();
                return true;
            } else {
                return false;
            }
        },
        setState() {
            if (this.workInfo.state === window.CONSTANTS.WORK_STATE.STOP) {
                this.isStart = false;
                this.isFinish = false;
            } else if (this.workInfo.state === window.CONSTANTS.WORK_STATE.IN_PROGRESS) {
                this.isStart = true;
                this.isFinish = false;
            } else {
                this.isStart = false;
                this.isFinish = true;
            }
        },
        handleEditButton() {
            if (!this.isStart) {
                this.isEdit = true;
            }
        },
        handleRemoveWork() {
            // TODO:
            // if (!this.isStart) {
            //     const data = {};
            //     if (!!this.workInfo) {
            //         data.id = this.workInfo.id;
            //         this.$emit('select-remove-work-button', data);
            //     } else {
            //         this.sweetbox.fire("there is no work data for remove")
            //     }
            // }
        },
        handleOkButton() {
            this.workInfo.start_time = this.startTime;
            this.workInfo.finish_time = this.finishTime;
            this.$emit('select-ok-button', this.workInfo);
        },
        handleCancelButton() {
            this.isEdit = false;
        },
        handleCloseButton() {
            this.$emit('select-close-button', {});
        },
        handleChangeWorkStartTime (e) {
            var startTime = new Date(e.target.value).getTime();
            this.startTime = startTime/1000
        },
        handleChangeWorkFinishTime (e) {
            var finishTime = new Date(e.target.value).getTime();
            this.finishTime = finishTime/1000;
        },
        handleStartWork() {
            if (!this.isStart && !this.isFinish) {
                if (this.workInfo.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS) {
                    this.sweetbox.fire("Already Started.");
                } else if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                    this.sweetbox.fire("Already Finish.");
                } else {
                    let data = {};
                    data.id = this.workInfo.id;
                    data.category = this.workInfo.category;
                    data.typ = this.workInfo.typ;
                    data.blast_id = this.workInfo.blast_id;
                    this.services.startWork(data, (resData) => {
                        this.workInfo = this.$store.getters.getWork(this.id);
                        this.setState();
                        console.log("success to start work");
                    }, (error) => {
                        console.log("fail to start work : ", error);
                    });
                }
            }
        },
        handleStopWork() {
            if (this.isStart && !this.isFinish) {
                if (this.workInfo.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS) {
                    this.sweetbox.fire({
                        title: 'Do you want to pause the work?',
                        input: 'text',
                        inputPlaceholder: 'Please write the reason',
                        showCancelButton: true,
                        confirmButtonText: "Pause",
                        preConfirm: (message) => {
                            let data = {};
                            data.id = this.workInfo.id;
                            data.category = this.workInfo.category;
                            data.typ = this.workInfo.typ;
                            data.message = message;
                            data.blast_id = this.workInfo.blast_id;
                            this.services.stopWork(data, (resData) => {
                                this.workInfo = this.$store.getters.getWork(this.id);
                                this.setState();
                                console.log("success to stop work");
                            }, (error) => {
                                console.log("fail to stop work : ", error);
                            });
                        }}
                    )
                    // let data = {};
                    // data.id = this.workInfo.id;
                    // data.category = this.workInfo.category;
                    // data.typ = this.workInfo.typ;
                    // data.blast_id = this.workInfo.blast_id;
                    // this.services.stopWork(data, (resData) => {
                    //     this.workInfo = this.$store.getters.getWork(this.id);
                    //     this.setState();
                    //     console.log("success to stop work");
                    // }, (error) => {
                    //     console.log("fail to stop work : ", error);
                    // });
                } else if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                    this.sweetbox.fire("Already Finish.");
                } else {
                    this.sweetbox.fire("Already Stop");
                }
            }
        },
        handleFinishWork() {
            if (!this.isFinish) {
                if (this.workInfo.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS) {
                    // TODO: not stop then can't finish?
                    let data = {};
                    data.id = this.workInfo.id;
                    data.category = this.workInfo.category;
                    data.typ = this.workInfo.typ;
                    data.blast_id = this.workInfo.blast_id;
                    this.services.finishWork(data, (resData) => {
                        this.workInfo = this.$store.getters.getWork(this.id);
                        console.log("success to finish work");
                    }, (error) => {
                        console.log("fail to finish work : ", error);
                    });
                } else if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                    this.sweetbox.fire("Already Finish.");
                } else {
                    let data = {};
                    data.id = this.workInfo.id;
                    data.category = this.workInfo.category;
                    data.typ = this.workInfo.typ;
                    data.blast_id = this.workInfo.blast_id;
                    this.services.finishWork(data, (resData) => {
                        this.workInfo = this.$store.getters.getWork(this.id);
                        console.log("success to finish work");
                    }, (error) => {
                        console.log("fail to finish work : ", error);
                    });
                }
            }
        },
        handleAddOperatorButton() {
            let operatorData = {}
            this._.forEach(this.operatorList, operator => {
                operatorData[operator.id] = operator.name;
            });
            this.sweetbox.fire({
                title: "Select Operator",
                input: "select",
                inputOptions: operatorData,
                inputPlaceholder: "Select an operator",
                showCancelButton: true,
                preConfirm: (value) => {
                    let data = {};
                    data.operator_id = value;
                    data.accum_time = 0;
                    data.p_accum_time = 0;
                    data.work_id = this.id;
                    this.services.addWorkOperator(data, (resData) => {
                        console.log("Success add work operator.", resData);
                    }, (error) => {
                        console.log("Fail to add work operator : ", error);
                    });
                }
            });
        },
        handleAddEquipmentButton() {
            let equipmentData = {};
            this._.forEach(this.equipmentList, equipment => {
                equipmentData[equipment.id] = equipment.name;
            });
            this.sweetbox.fire({
                title: "Select Equipment",
                input: "select",
                inputOptions: equipmentData,
                inputPlaceholder: "Select an Equipment",
                showCancelButton: true,
                preConfirm: (value) => {
                    let data = {};
                    data.equipment_id = value;
                    data.accum_time = 0;
                    data.p_accum_time = 0;
                    data.work_id = this.id;
                    this.services.addWorkEquipment(data, (resData) => {
                        console.log("Success add work eqiupment.", resData);
                    }, (error) => {
                        console.log("Fail to add work equipment : ", error);
                    });
                }
            });
        },
        formatDate(date) {
            var dateInfo = new Date(date),
                month = '' + (dateInfo.getMonth() + 1),
                day = '' + dateInfo.getDate(),
                year = dateInfo.getFullYear();
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            return [year, month, day].join('-');
        }
    },
    computed: {
        getWorkCategory() {
            return window.CONSTANTS.CATEGORY_NAME[this.workInfo.category];
        },
        getWorkType() {
            return window.CONSTANTS.WORK_NAME[this.workInfo.typ];
        },
        getWorkState() {
            return window.CONSTANTS.WORK_STATE_NAME[this.workInfo.state];
        },
        getFinishTime() {
            let finishTime = null;
            if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                if (this.workInfo.work_history_list.length > 0) {
                    finishTime = this.workInfo.work_history_list[0].timestamp;
                }
            }
            return finishTime;
        },
        getStartTime() {
            let startTime = null;
            if (this.workInfo.work_history_list != undefined &&
                this.workInfo.work_history_list.length > 0) {
                startTime = this.workInfo.work_history_list[this.workInfo.work_history_list.length - 1].timestamp;
            }
            return startTime;
        },
        getTotalTime() {
            let tmpTime = new Date(0);
            tmpTime.setSeconds(this.workInfo.accum_time);
            return tmpTime.toISOString().substr(11,8);
        },
        getPauseTotalTime() {
            let tmpTime = new Date(0);
            tmpTime.setSeconds(this.workInfo.p_accum_time);
            return tmpTime.toISOString().substr(11,8);
        }
    },
    created() {
    }
}
</script>
<style>
.work-info-container {
    position: absolute;
    width: 400px;
    height: 100%;
    right: 0;
    z-index: 1;
    background-color: #39B2FF;
    color: #ffffff;
    cursor: default;
    border-radius: 10px 0 0 10px!important;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
}
.work-info-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.work-info-body-container {
    width: 100%;
    height: 85%;
    padding: 1em;
    overflow-y: scroll;
}
.work-info-body-container.edit {
    height: 75%;
}
.work-info-body-content-container {
    font-size: 1.4em;
}
.work-info-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.work-info-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 15px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    color: #1b94e2;
    padding: 5px;
    box-sizing: border-box;
    display: inline-block
}
.work-info-body-button-container {
    text-align: center;
}
.work-info-body-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
.work-info-body-button.buttonDisabled {
    cursor: not-allowed;
    color: rgb(150, 150, 150, 0.7)
}
.work-info-body-button.buttonFinishDisabled {
    cursor: not-allowed;
    color: rgb(150, 150, 150, 0.7)
}
.work-info-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.work-info-ok-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
.work-info-cancel-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
.panel-close-button {
    position: absolute;
    background-size: 20px !important;
    background-color: rgba(255 117 117) !important;
    background-image: url(../../public/static/imgs/close.png);
    border-radius: 10px 0 0 10px!important;
    height: 40px;
    width: 40px;
    background-repeat: no-repeat;
    background-position: center center;
    left: -40px;
    top: 10px;
    cursor: pointer;
}

.work-info-body-list-container {
    text-align: center;
}
.work-info-body-list-title-container {
    font-size: 24px;
    width: 100%;
    margin-top: 1em;
    margin-bottom: 0.4em;
}
.work-info-body-sub-list-container {
    background-color: #ffffff;
    border: 2px solid ffffff;
    width: 100%;
    height: 5em;
    overflow: scroll;
    border-radius: 10px;
}
.work-info-content-list-container {
    width: 100%;
}
.work-info-body-list-button-container {
}
.work-info-body-list-button-add {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 12em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}

</style>