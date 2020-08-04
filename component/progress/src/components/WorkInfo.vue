<template>
    <div v-if="isType()">
        <div>
            <AddWorkEquipmentListItem :isOpen="isOpenAddWorkEquipment"
                :operatorList="operatorList" :equipmentList="equipmentList"
                @select-add-button="handleAddEquipmentAddButton"
                @select-cancel-button="handleAddEquipmentCancelButton">
            </AddWorkEquipmentListItem>
        </div>
        <div v-if="isEdit" id="workInfoEditor" class="work-info-container">
            <div class="work-info-title-container">
                ACTIVITY DETAILS
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
                    <div class="work-info-body-content-title">Status</div>
                    <input id="workState" type="text" class="work-info-body-content-message"
                        :value="getWorkState" maxlength="30" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Start Date</div>
                    <input id="workStartTime" type="date" class="work-info-body-content-message"
                        :value="getStartDate" @change="handleChangeWorkStartDate" />
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Start Time</div>
                    <input id="workStartTime" type="time" class="work-info-body-content-message"
                        :value="getStartTime" @change="handleChangeWorkStartTime" />
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Finish Date</div>
                    <input id="workFinishTime" type="date" class="work-info-body-content-message"
                        :value="getFinishDate" @change="handleChangeWorkFinishDate" />
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Finish Time</div>
                    <input id="workFinishTime" type="time" class="work-info-body-content-message"
                        :value="getFinishTime" @change="handleChangeWorkFinishTime" />
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
                ACTIVITY DETAILS
            </div>
            <div class="work-info-body-container">
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Excavt. ID</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getTunnelId" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Category</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getWorkCategory" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Activity</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getWorkType" maxlength="30" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Status</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getWorkState" readonly/>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Start Time</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getStartTimeStr" readonly>
                </div>
                <div class="work-info-body-content-container">
                    <div class="work-info-body-content-title">Finish Time</div>
                    <input type="text" class="work-info-body-content-message"
                        :value="getFinishTimeStr" readonly>
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
                <div class="work-info-body-button-container line">
                    <div class="work-info-body-button" :class="{ buttonDisabled: isStart }"
                        @click="handleEditButton">Edit</div>
                    <div class="work-info-body-button" :class="{ buttonDisabled: isStart }"
                        @click="handleRemoveWork">Remove</div>
                </div>

                <div class="work-info-pause-detail-container">
                    <div class="detail-title-container" @click="handlePauseDetail">
                        <div class="detail-title">Pause Time Detail </div>
                        <div class="button-image position" :class="{ down : isPauseClose }"></div>
                    </div>
                    <div id="detailInfo" class="detail-container" :class="{ close: isPauseClose }">
                        <div v-if="isView" class="work-info-body-list-container">
                            <div class="work-info-body-list-title-container">
                                Pause Total Time( {{ getPauseTotalTime }} )
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
                    </div>


                    <div class="work-info-equip-detail-container">
                        <div class="detail-title-container" @click="handleEquipDetail">
                            <div class="detail-title">Equipment Detail </div>
                            <div class="button-image position" :class="{ down : isEquipClose }"></div>
                        </div>
                        <div id="detailInfo" class="detail-container" :class="{ close: isEquipClose }">
                            <div class="work-info-body-list-container">
                                <div class="work-info-body-list-title-container">
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
            </div>
        </div>
    </div>
</template>
<script>
import PauseListItem from '@/components/PauseListItem';
import AddWorkEquipmentListItem from '@/components/AddWorkEquipmentListItem';
import WorkEquipmentListItem from '@/components/WorkEquipmentListItem';
export default {
    name: 'WorkInfo',
    components: {
        PauseListItem,
        AddWorkEquipmentListItem,
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
            startTimestamp: null,
            finishTimestamp: null,
            startDate: null,
            finishDate: null,
            totalDuration: null,
            workInfo: null,
            blastInfo: null,
            tunnelInfo: null,
            startTimeCheckState: false,
            finishTimeCheckState: false,
            isPauseClose: true,
            isEquipClose: true,
            isOpenAddWorkEquipment: false,
            isView: false,
            refState: false
        }
    },
    methods: {
        _clearData() {
            this.isEdit = false;
            this.isStart = false;
            this.isFinish = false;
            this.startTime = null;
            this.finishTime = null;
            this.startDate = null;
            this.finishDate = null;
            this.startTimestamp = null;
            this.finishTimestamp = null;
            this.totalDuration = null;
            this.startTimeCheckState = false;
            this.finishTimeCheckState = false;
            this.workInfo = null;
            this.blastInfo = null
            this.tunnelInfo = null;
            this.isPauseClose = true;
            this.isEquipClose = true;
            this.isOpenAddWorkEquipment = false;
            this.isView = false;
            this.refState = false;
        },
        isType() {
            if (this.type == window.CONSTANTS.TYPE.SELECT_WORK) {
                this.workInfo = this.$store.getters.getWork(this.id);
                this.blastInfo = this.$store.getters.getBlast(this.workInfo.blast_id);
                this.tunnelInfo = this.$store.getters.getTunnel(this.blastInfo.tunnel_id);
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
             if (!this.isStart) {
                 const data = {};
                 if (!!this.workInfo) {
                     if (this.workInfo.typ == this.blastInfo.work_list[0].typ) {
                        data.id = this.workInfo.id;
                        this._clearData();
                        this.$emit('select-remove-work-button', data);
                     } else {
                        this.sweetbox.fire("More recent work already exists than the data you want to delete. Please check the work data.")
                     }
                 } else {
                     this.sweetbox.fire("there is no work data for remove")
                 }
             }
        },
        _startTimeCheck(blast) {
            if (!!this.startTimestamp)  {
                const work_list = blast.work_list,
                      index = work_list.findIndex(x => x.id === this.id);
                if (work_list.length == 1) {
                    if (!!blast.blast_info.blasting_time) {
                        const blasting_time = new Date(blast.blast_info.blasting_time).getTime() / 1000;
                        if (blasting_time > this.startTimestamp) {
                            this.sweetbox.fire("The time you want to change cannot be less than the blast time. Please reset the time.");
                        } else {
                            this.workInfo.start_time = this.startTimestamp;
                            this.startTimeCheckState = true;
                        }
                    } else {
                        this.sweetbox.fire("Blast time is not set. Please set the Blast time first and try changing it again.");
                    }
                } else if (work_list.length > 1) {
                    if (index == work_list.length - 1) {
                        if (!!blast.blast_info.blasting_time) {
                            const blasting_time = new Date(blast.blast_info.blasting_time).getTime() / 1000;
                            if (blasting_time > this.startTimestamp) {
                                this.sweetbox.fire("The time you want to change cannot be less than the blast time. Please reset the time.");
                            } else {
                                this.workInfo.start_time = this.startTimestamp;
                                this.startTimeCheckState = true;
                            }
                        } else {
                            this.sweetbox.fire("Blast time is not set. Please set the Blast time first and try changing it again.");
                        }
                    } else {
                        let beforeWorkFinishTime = new Date(work_list[index + 1].work_history_list[0].timestamp).getTime() / 1000;
                        if (beforeWorkFinishTime > this.startTimestamp) {
                            this.sweetbox.fire("The start time you want to change is less than the end time of the previous work. Please check the time again.");
                        } else {
                            this.workInfo.start_time = this.startTimestamp;
                            this.startTimeCheckState = true;
                        }
                    }
                }
            } else {
                this.startTimeCheckState = true;
            }
        },
        _finishTimeCheck(blast) {
            if (!!this.finishTimestamp) {
                const work_list = blast.work_list,
                      tunnelInfo = this.tunnelInfo,
                      blast_list = tunnelInfo.blast_list,
                      blastIndex = blast_list.findIndex(x => x.id === this.blastId),
                      workIndex = work_list.findIndex(x => x.id === this.id)
                if (blast_list.length == 1) {
                    if (workIndex == 0) {
                        this.workInfo.finish_time = this.finishTimestamp;
                        this.finishTimeCheckState = true;
                    } else if (workIndex > 0) {
                        let nextWorkStartTime = null;
                        if (work_list[workIndex - 1].work_history_list.length == 1) {
                            nextWorkStartTime = new Date(work_list[workIndex - 1].work_history_list[0].timestamp).getTime() / 1000;
                        } else if (work_list[workIndex - 1].work_history_list.length == 2) {
                            nextWorkStartTime = new Date(work_list[workIndex - 1].work_history_list[1].timestamp).getTime() / 1000;
                        }
                        if (nextWorkStartTime > this.finishTimestamp) {
                            this.sweetbox.fire("The finish time you are trying to change cannot be greater than the start time for the next work. Please change the time again.");
                        } else {
                            this.workInfo.finish_time = this.finishTimestamp;
                            this.finishTimeCheckState = true;
                        }
                    }
                } else {
                    if (blastIndex == 0) {
                        if (workIndex == 0) {
                            this.workInfo.finish_time = this.finishTimestamp;
                            this.finishTimeCheckState = true;
                        } else if (workIndex > 0) {
                            let nextWorkStartTime = null;
                            if (work_list[workIndex - 1].work_history_list.length == 1) {
                                nextWorkStartTime = new Date(work_list[workIndex - 1].work_history_list[0].timestamp).getTime() / 1000;
                            } else if (work_list[workIndex - 1].work_history_list.length == 2) {
                                nextWorkStartTime = new Date(work_list[workIndex - 1].work_history_list[1].timestamp).getTime() / 1000;
                            }
                            if (nextWorkStartTime < this.finishTimestamp) {
                                this.sweetbox.fire("The finish time you are trying to change cannot be greater than the start time for the next work. Please change the time again.");
                            } else {
                                this.workInfo.finish_time = this.finishTimestamp;
                                this.finishTimeCheckState = true;
                            }
                        }
                    } else if (blastIndex > 0) {
                        if (workIndex == 0) {
                            let nextBlastingTime = new Date(blast_list[blastIndex - 1].blast_info.blasting_time).getTime() / 1000;
                            if (nextBlastingTime < this.finishTimestamp) {
                                this.sweetbox.fire("The work finish time you are trying to change cannot be greater than the following blast time. Please check the time again.");
                            } else {
                                this.workInfo.finish_time = this.finishTimestamp;
                                this.finishTimeCheckState = true;
                            }
                        } else if (workIndex > 0) {
                            let nextWorkStartTime = null;
                            if (work_list[workIndex - 1].work_history_list.length == 1) {
                                nextWorkStartTime = new Date(work_list[workIndex - 1].work_history_list[0].timestamp).getTime() / 1000;
                            } else if (work_list[workIndex - 1].work_history_list.length == 2) {
                                nextWorkStartTime = new Date(work_list[workIndex - 1].work_history_list[1].timestamp).getTime() / 1000;
                            }
                            if (nextWorkStartTime > this.finishTimestamp) {
                                this.sweetbox.fire("The finish time you are trying to change cannot be greater than the start time for the next work. Please change the time again.");
                            } else {
                                this.workInfo.finish_time = this.finishTimestamp;
                                this.finishTimeCheckState = true;
                            }
                        }
                    }
                }
            } else {
                this.finishTimeCheckState = true;
            }
        },
        handleOkButton() {
            let blast = this.blastInfo;
            this._startTimeCheck(blast);
            this._finishTimeCheck(blast);
            if (this.startTimeCheckState && this.finishTimeCheckState) {
                this.$emit('select-ok-button', this.workInfo);
                this.isEdit = false;
                this._clearData();
            }
        },
        handleCancelButton() {
            this._clearData();
            this.isEdit = false;
        },
        handleCloseButton() {
            let blast = this.$store.getters.getBlast(this.blastId);
            this.$emit('select-close-button', blast);
            this._clearData();
        },
        handleChangeWorkStartTime (e) {
            this.startTime = e.target.value
            this.startTimestamp = new Date(this.startDate + "T" + this.startTime).getTime()/1000
        },
        handleChangeWorkStartDate (e) {
            this.startDate = e.target.value
            this.startTimestamp = new Date(this.startDate + "T" + this.startTime).getTime()/1000
        },
        handleChangeWorkFinishTime (e) {
            this.finishTime = e.target.value
            this.finishTimestamp = new Date(this.finishDate + "T" + this.finishTime).getTime()/1000
        },
        handleChangeWorkFinishDate (e) {
            this.finishDate = e.target.value
            this.finishTimestamp = new Date(this.finishDate + "T" + this.finishTime).getTime()/1000
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
            this.refState = this.isPauseClose;
            if (!!!this.isPauseClose) {
                this.handlePauseDetail();
            }
        },
        refreshPauseList() {
            if (!!!this.refState) {
                this.handlePauseDetail();
            }
        },
        handleStopWork() {
            if (this.isStart && !this.isFinish) {
                if (this.workInfo.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS) {
                    let messageList = this.$store.getters.getMessageList(),
                        inputOptions = {};
                    this._.forEach(messageList, (message) => {
                        inputOptions[message.id] = message.message;
                    });
                    this.sweetbox.fire({
                        title: 'Do you want to pause the work?',
                        input: 'select',
                        inputPlaceholder: 'Please select the reason',
                        inputOptions: inputOptions,
                        showCancelButton: true,
                        confirmButtonText: "Pause",
                        preConfirm: (id) => {
                            let data = {};
                            data.id = this.workInfo.id;
                            data.category = this.workInfo.category;
                            data.typ = this.workInfo.typ;
                            data.blast_id = this.workInfo.blast_id;
                            if (!!!id) {
                                this.sweetbox.fire("No pause reason selected. Please select a reason message.");
                            } else {
                                data.message = this.$store.getters.getMessage(id).message;
                                this.services.stopWork(data, (resData) => {
                                    this.workInfo = this.$store.getters.getWork(this.id);
                                    this.setState();
                                    console.log("success to stop work");
                                }, (error) => {
                                    console.log("fail to stop work : ", error);
                                });
                            }
                        }}
                    )
                } else if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                    this.sweetbox.fire("Already Finish.");
                } else {
                    this.sweetbox.fire("Already Stop");
                }
            }
        },
        handleFinishWork() {
            if (!this.isFinish) {
                let workInfo = this.workInfo,
                    finishWork = this.services.finishWork;
                this.sweetbox.fire({
                    title: 'Are you sure you want to finish?',
                    text: "The finish button was clicked. If you want to finish, click Yes or NO.",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, finish!',
                    cancelButtonText: 'No, cancel!',
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: true
                }).then(function(isConfirm) {
                    if (isConfirm.value === true) {
                        if (workInfo.state == window.CONSTANTS.WORK_STATE.IN_PROGRESS) {
                            let data = {};
                            data.id = workInfo.id;
                            data.category = workInfo.category;
                            data.typ = workInfo.typ;
                            data.blast_id = workInfo.blast_id;
                            finishWork(data, (resData) => {
                                console.log("success to finish work");
                            }, (error) => {
                                console.log("fail to finish work : ", error);
                            });
                        } else if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                            this.sweetbox.fire("Already Finish.");
                        } else {
                            let data = {};
                            data.id = workInfo.id;
                            data.category = workInfo.category;
                            data.typ = workInfo.typ;
                            data.blast_id = workInfo.blast_id;
                            finishWork(data, (resData) => {
                                console.log("success to finish work");
                            }, (error) => {
                                console.log("fail to finish work : ", error);
                            });
                        }
                    }
                })
            }
            this.refState = this.isPauseClose;
            if (!!!this.isPauseClose) {
                this.handlePauseDetail();
            }
        },
        handleAddEquipmentButton() {
            this.isOpenAddWorkEquipment = true;
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
        },
        handlePauseDetail() {
            this.isPauseClose = !this.isPauseClose;
            this.isView = !this.isView;
        },
        handleEquipDetail() {
            this.isEquipClose = !this.isEquipClose;
        },
        handleAddEquipmentAddButton(equipmentId, operatorId) {
            let data = {};
                data.equipment_id = equipmentId;
                data.operator_id = operatorId;
                data.accum_time = 0;
                data.p_accum_time = 0;
                data.work_id = this.id;
            this.services.addWorkEquipment(data, (resData) => {
                console.log("Success add work eqiupment.", resData);
                this.isOpenAddWorkEquipment = false;
            }, (error) => {
                console.log("Fail to add work equipment : ", error);
                this.isOpenAddWorkEquipment = false;
            });
        },
        handleAddEquipmentCancelButton() {
            this.isOpenAddWorkEquipment = false;
        }
    },
    computed: {
        getTunnelId() {
            let tunnelId = this.tunnelInfo.tunnel_id + "_CH." +
                this.blastInfo.blast_info.start_point.toFixed(1) + "~CH." +
                this.blastInfo.blast_info.finish_point.toFixed(1);
            return tunnelId;
        },
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
            let finishTime = '';
            if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                if (this.workInfo.work_history_list.length > 0) {
                    finishTime = this.workInfo.work_history_list[0].timestamp;
                }
            }
            this.finishTime = finishTime.substring(11,19);
            return finishTime.substring(11,19);
        },
        getFinishDate() {
            let finishDate = '';
            if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                if (this.workInfo.work_history_list.length > 0) {
                    finishDate = this.workInfo.work_history_list[0].timestamp;
                }
            }
            this.finishDate = finishDate.substring(0,10);
            return finishDate.substring(0,10);
        },
        getFinishTimeStr() {
            let finishTime = '';
            if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                if (this.workInfo.work_history_list.length > 0) {
                    finishTime = this.workInfo.work_history_list[0].timestamp.substring(0, 16);
                    this.finishTimestamp = new Date(this.workInfo.work_history_list[0].timestamp).getTime()/1000
                    finishTime = finishTime.replace("T", ". ");
                    finishTime = finishTime.replace("-", ". ");
                    finishTime = finishTime.replace("-", ". ");
                }
            }
            return finishTime;
        },
        getTime() {
            let startTime = 'Not Started';
            if (this.workInfo.work_history_list != undefined &&
                this.workInfo.work_history_list.length > 0) {
                startTime = this.workInfo.work_history_list[this.workInfo.work_history_list.length - 1].timestamp;
            }
            return startTime;
        },
        getStartDate() {
            let startDate = '';
            if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                if (this.workInfo.work_history_list.length == 1) {
                    startDate = this.workInfo.work_history_list[0].timestamp;
                } else if (this.workInfo.work_history_list.length == 2) {
                    startDate = this.workInfo.work_history_list[1].timestamp;
                }
            }
            this.startDate = startDate.substring(0,10);
            return startDate.substring(0,10);
        },
        getStartTime() {
            let startTime = '';
            if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                if (this.workInfo.work_history_list.length == 1) {
                    startTime = this.workInfo.work_history_list[0].timestamp;
                } else if (this.workInfo.work_history_list.length == 2) {
                    startTime = this.workInfo.work_history_list[1].timestamp;
                }
            }
            this.startTime = startTime.substring(11,19)
            return startTime.substring(11,19);
        },
        getStartTimeStr() {
            let startTime = 'Not Started';
            if (this.workInfo.work_history_list != undefined &&
                this.workInfo.work_history_list.length > 0) {
                startTime = this.workInfo.work_history_list[this.workInfo.work_history_list.length - 1].timestamp.substring(0, 16);
                this.startTimestamp = new Date(this.workInfo.work_history_list[0].timestamp).getTime()/1000
                startTime = startTime.replace("T", ". ");
                startTime = startTime.replace("-", ". ");
                startTime = startTime.replace("-", ". ");
            }
            return startTime;
        },
        getTotalTime() {
            let tmpTime = new Date(0);
            if (!!!this.totalDuration) {
                this.totalDuration = this.workInfo.accum_time;
            }
            tmpTime.setSeconds(this.totalDuration);
            // OLD format
            // return tmpTime.toISOString().substr(11,8);
            let tList = tmpTime.toISOString().substr(9,7).split('T');
            let day = parseInt(tList[0]) - 1;
            let tStr = tList[1].split(":");
            let h = tStr[0] + 'H';
            let m = tStr[1] + "M";
            return day + "D" + " " + h + " " + m
        },
        getPauseTotalTime() {
            let tmpTime = new Date(0);
            tmpTime.setSeconds(this.workInfo.p_accum_time);
            // OLD format
            // return tmpTime.toISOString().substr(11,8);
            let tList = tmpTime.toISOString().substr(9,7).split('T');
            let day = parseInt(tList[0]) - 1;
            let tStr = tList[1].split(":");
            let h = tStr[0] + 'H';
            let m = tStr[1] + "M";
            return day + "D" + " " + h + " " + m;
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
    font-size: 14px;
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
.work-info-body-button-container.line {
    border-bottom: 2px solid #ffffff;
    padding-bottom: 8px;
    margin-bottom: 8px;
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
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
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
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
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
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
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
    width: 95%;
    margin-left: 3.5%;
}
.work-info-body-list-container.line {
    border-bottom: 2px solid #ffffff;
    padding-bottom: 8px;
}
.work-info-body-list-title-container {
    font-size: 16px;
    width: 100%;
    margin-top: 0.2em;
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
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
}

.work-info-pause-detail-container {
    width: 100%;
    height: 2em;
    text-align: center;
}
.detail-title-container {
    width: 100%;
    height: 100%;
    margin: 5px;
    padding: 2px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #eef0fa;
    color: #1b94e2;
    text-align: center
}
.detail-title {
    display: inline-block;
    width: 90%;
}
.detail-container {
    padding: 4px;
}
.detail-container.close {
    display: none;
}
.button-image.position {
    position: unset;
    display: inline-block;
    width: 15px;
    height: 15px;
    background-color: white;
    background-image: url('../assets/imgs/up-arrow.png');
}
.button-image.down {
    background-image: url('../assets/imgs/down-arrow.png');
}

.work-info-equip-detail-container {
    width: 100%;
    height: 2em;
    text-align: center;
}

</style>