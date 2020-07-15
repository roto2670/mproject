<template>
    <div v-if="isType()">
        <div class="work-info-container">
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

                <div class="work-info-pause-detail-container">
                    <div class="detail-title-container" @click="handlePauseDetail">
                        <div class="detail-title">Pause Time Detail </div>
                        <div class="button-image position" :class="{ down : isPauseClose }"></div>
                    </div>
                    <div id="detailInfo" class="detail-container" :class="{ close: isPauseClose }">
                        <div class="work-info-body-list-container">
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
import WorkEquipmentListItem from '@/components/WorkEquipmentListItem';
export default {
    name: 'WorkInfo',
    components: {
        PauseListItem,
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
            isStart : false,
            isFinish : false,
            startTime: null,
            finishTime: null,
            workInfo: null,
            blastInfo: null,
            tunnelInfo: null,
            isPauseClose: true,
            isEquipClose: true,
            isOpenAddWorkEquipment: false
        }
    },
    methods: {
        _clearData() {
            this.isStart = false;
            this.isFinish = false;
            this.startTime = null;
            this.finishTime = null;
            this.workInfo = null;
            this.blastInfo = null;
            this.tunnelInfo = null;
            this.isPauseClose = true;
            this.isEquipClose = true;
            this.isOpenAddWorkEquipment = false;
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
        handleCloseButton() {
            this.$emit('select-close-button', {});
            this._clearData();
        },
        handlePauseDetail() {
            this.isPauseClose = !this.isPauseClose;
        },
        handleEquipDetail() {
            this.isEquipClose = !this.isEquipClose;
        },
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
            return finishTime;
        },
        getFinishTimeStr() {
            let finishTime = '';
            if (this.workInfo.state == window.CONSTANTS.WORK_STATE.FINISH) {
                if (this.workInfo.work_history_list.length > 0) {
                    finishTime = this.workInfo.work_history_list[0].timestamp.substring(0, 16);
                    finishTime = finishTime.replace("T", ". ");
                    finishTime = finishTime.replace("-", ". ");
                    finishTime = finishTime.replace("-", ". ");
                }
            }
            return finishTime;
        },
        getStartTime() {
            let startTime = 'Not Started';
            if (this.workInfo.work_history_list != undefined &&
                this.workInfo.work_history_list.length > 0) {
                startTime = this.workInfo.work_history_list[this.workInfo.work_history_list.length - 1].timestamp;
            }
            return startTime;
        },
        getStartTimeStr() {
            let startTime = 'Not Started';
            if (this.workInfo.work_history_list != undefined &&
                this.workInfo.work_history_list.length > 0) {
                startTime = this.workInfo.work_history_list[this.workInfo.work_history_list.length - 1].timestamp.substring(0, 16);
                startTime = startTime.replace("T", ". ");
                startTime = startTime.replace("-", ". ");
                startTime = startTime.replace("-", ". ");
            }
            return startTime;
        },
        getTotalTime() {
            let tmpTime = new Date(0);
            tmpTime.setSeconds(this.workInfo.accum_time);
            // OLD format
            // return tmpTime.toISOString().substr(11,8);
            let tList = tmpTime.toISOString().substr(9,7).split('T');
            let day = parseInt(tList[0]) - 1;
            let tStr = tList[1].split(":");
            let h = tStr[0] + 'H';
            let m = tStr[1] + "M";
            return day + "D" + " " + h + " " + m;
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
    font-size: 15px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    color: #1b94e2;
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
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
    color: rgb(150, 150, 150, 0.7);
}
.work-info-body-button.buttonFinishDisabled {
    cursor: not-allowed;
    color: rgb(150, 150, 150, 0.7);
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
    background-image: url(../../public/static/location/imgs/close.svg);
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
    text-align: center;
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
    border-radius: 10px;
    background-size: contain;
    background-color: white;
    background-image: url('../../public/static/up-arrow.png');
}
.button-image.down {
    background-image: url('../../public/static/down-arrow.png');
}

.work-info-equip-detail-container {
    width: 100%;
    height: 2em;
    text-align: center;
}

</style>