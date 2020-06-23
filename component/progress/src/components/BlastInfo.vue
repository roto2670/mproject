<template>
    <div v-if="isType()">
        <div v-if="isEdit" id="blastInfoEditor" class="blast-info-container">
        </div>
        <div v-else id="blastInfoEditor" class="blast-info-container">
            <div class='panel-close-button' @click="handleCloseButton"></div>
            <div class="blast-info-title-container">
                Work Information
            </div>
            <div class="blast-info-body-container">
                <div class="blast-info-body-content-container">
                    <div class="blast-info-body-content-title">Tunnel ID</div>
                    <input class="blast-info-body-content-message" type="text"
                        :value="getTunnelId" readonly>
                </div>
                <div class="blast-info-body-content-container">
                    <div class="blast-info-body-content-title">Cycle Time</div>
                    <input class="blast-info-body-content-message" type="text"
                        :value="getTotalTime" readonly>
                </div>
                <div class="blast-info-body-content-container">
                    <div class="blast-info-information-button"
                        @click="handleInformationButton">
                    Blast Information
                    </div>
                </div>

                <div class="blast-info-body-work-container">
                    <div class="blast-info-body-work-title-container">
                        Activity List
                    </div>
                    <div class="blast-info-body-work-list-container">
                        <div class="main-work-list-container">
                            <div class="main-work-list-text" onclick="if(mainWorkList.style.display=='none') {mainWorkList.style.display='';} else {mainWorkList.style.display = 'none';}">
                                <div class="main-work-list-title">Main Work </div>
                                <div class="main-work-list-time">({{getMainWorkTime}})</div>
                                <div class="main-work-list-progress"><progress class="progressbar" max="100" :value="getMainWorkPercent"></progress></div>
                                <div class="main-work-list-progress-number">({{getMainWorkPercent}}%)</div>
                            </div>
                            <div id="mainWorkList" style="display: none">
                                <WorkListItem v-for="workId in workIdList" :key="workId" :id="workId"
                                    @select-item="handleSelectWorkItem">
                                </WorkListItem>
                            </div>
                        </div>
                        <div class="supporting-work-list-container">
                            <div class="supporting-work-list-text" onclick="if(supportingWorkList.style.display=='none') {supportingWorkList.style.display='';} else {supportingWorkList.style.display = 'none';}">
                                <div class="main-work-list-title">Supporting </div>
                                <div class="main-work-list-time">({{getSupportingTime}})</div>
                                <div class="main-work-list-progress"><progress class="progressbar" max="100" :value="getSupportingPercent"></progress></div>
                                <div class="main-work-list-progress-number">({{getSupportingPercent}}%)</div>
                            </div>
                            <div id="supportingWorkList" style="display: none">
                                <WorkListItem v-for="supportingId in supportingIdList" :key="supportingId" :id="supportingId"
                                    @select-item="handleSelectWorkItem">
                                </WorkListItem>
                            </div>
                        </div>
                        <div class="idle-time-list-container">
                            <div class="idle-time-list-text" onclick="if(idleTimeList.style.display=='none') {idleTimeList.style.display='';} else {idleTimeList.style.display = 'none';}">
                                <div class="main-work-list-title">Idle Time </div>
                                <div class="main-work-list-time">({{getIdleTime}})</div>
                                <div class="main-work-list-progress"><progress class="progressbar" max="100" :value="getIdleTimePercent"></progress></div>
                                <div class="main-work-list-progress-number">({{getIdleTimePercent}}%)</div>
                            </div>
                            <div id="idleTimeList" style="display: none">
                                <WorkListItem v-for="idleId in idleIdList" :key="idleId" :id="idleId"
                                    @select-item="handleSelectWorkItem">
                                </WorkListItem>
                            </div>
                        </div>
                    </div>
                    <div class="blast-info-body-work-button-container">
                        <div class="blast-info-body-work-button-add" :class="{ buttonDisabled: isFinish }"
                            @click="handleAddWorkButton">ADD ACTIVITY</div>
                    </div>
                </div>
            </div>
            <div class="blast-info-button-container">
            </div>
        </div>
    </div>
</template>
<script>
import WorkListItem from '@/components/WorkListItem';
export default {
    name: 'BlastInfo',
    components: {
        WorkListItem
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
        id: {
            type: String
        },
        workIdList: {
            type: Array
        },
        supportingIdList: {
            type: Array
        },
        idleIdList: {
            type: Array
        },
    },
    data() {
        return {
            isEdit: false,
            isFinish: false,
            blastName: '',
            blast: null,
            tunnel: null,
        }
    },
    methods: {
        _clearData() {
            this.isEdit = false;
            this.isFinish = false;
            this.blastName = '';
            this.blast = null;
            this.tunnel = null;
        },
        isType() {
            if (this.type == window.CONSTANTS.TYPE.SELECT_BLAST) {
                this.blast = this.$store.getters.getBlast(this.id);
                this.tunnel = this.$store.getters.getTunnel(this.blast.tunnel_id);
                this.setState();
                return true;
            } else {
                return false;
            }
        },
        setState() {
            if (this.blast.state === window.CONSTANTS.WORK_STATE.IN_PROGRESS) {
                this.isFinish = false;
            } else {
                this.isFinish = true;
            }
        },
        //   handleOkButton() {
        //       const data = {};
        //       data._id = this.id;
        //       data.name = this.blastName;
        //       this.$emit('select-ok-button', data);
        //   },
        //   handleCancelButton() {
        //       this.isEdit = false;
        //   },
        handleCloseButton() {
            this.$emit('select-close-button', {});
            this._clearData();
        },
        handleInformationButton() {
            this.$emit('select-information-button', this.id);
            this._clearData();
        },
        handleEditBlastButton() {
            this.isEdit = true;
        },
        handleRemoveBlastButton() {
        },
        handleAddWorkButton() {
            if (!this.isFinish) {
                this.$emit('select-add-work-button', this.id);
                this._clearData();
            }
        },
        handleChangeBlastName(e) {
            this.blastName = e.target.value;
        },
        handleSelectWorkItem(workId) {
            this.$emit("select-work-item", workId);
            this._clearData();
        }
    },
    computed: {
        getMainWorkTime() {
            let tmpTime = new Date(0);
            tmpTime.setSeconds(this.blast.m_accum_time);
            // OLD format
            // return tmpTime.toISOString().substr(11,8);
            let tList = tmpTime.toISOString().substr(9,7).split('T');
            let day = parseInt(tList[0]) - 1;
            let tStr = tList[1].split(":");
            let h = tStr[0] + 'H';
            let m = tStr[1] + "M";
            return day + "D" + " " + h + " " + m;
        },
        getSupportingTime() {
            let tmpTime = new Date(0);
            tmpTime.setSeconds(this.blast.s_accum_time);
            // OLD format
            // return tmpTime.toISOString().substr(11,8);
            let tList = tmpTime.toISOString().substr(9,7).split('T');
            let day = parseInt(tList[0]) - 1;
            let tStr = tList[1].split(":");
            let h = tStr[0] + 'H';
            let m = tStr[1] + "M";
            return day + "D" + " " + h + " " + m;
        },
        getIdleTime() {
            let tmpTime = new Date(0);
            tmpTime.setSeconds(this.blast.i_accum_time);
            // OLD format
            // return tmpTime.toISOString().substr(11,8);
            let tList = tmpTime.toISOString().substr(9,7).split('T');
            let day = parseInt(tList[0]) - 1;
            let tStr = tList[1].split(":");
            let h = tStr[0] + 'H';
            let m = tStr[1] + "M";
            return day + "D" + " " + h + " " + m;
        },
        getTotalTime() {
            let tmpTime = new Date(0);
            tmpTime.setSeconds(this.blast.accum_time);
            // OLD format
            // return tmpTime.toISOString().substr(11,8);
            let tList = tmpTime.toISOString().substr(9,7).split('T');
            let day = parseInt(tList[0]) - 1;
            let tStr = tList[1].split(":");
            let h = tStr[0] + 'H';
            let m = tStr[1] + "M";
            return day + "D" + " " + h + " " + m;
        },
        getTunnelId() {
            return this.tunnel.tunnel_id;
        },
        getMainWorkPercent() {
            let mwTime = this.blast.m_accum_time,
                totalTime = this.blast.accum_time;
            if (mwTime != 0 && totalTime != 0) {
                return Math.round((mwTime / totalTime) * 100);
            } else {
                return 0;
            }
        },
        getSupportingPercent() {
            let sTime = this.blast.s_accum_time,
                totalTime = this.blast.accum_time;
            if (sTime != 0 && totalTime != 0) {
                return Math.round((sTime / totalTime) * 100);
            } else {
                return 0;
            }
        },
        getIdleTimePercent() {
            let idleTime = this.blast.i_accum_time,
                totalTime = this.blast.accum_time;
            if (idleTime != 0 && totalTime != 0) {
                return Math.round((idleTime / totalTime) * 100);
            } else {
                return 0;
            }
        },
    },
    created() {
    }
}
</script>
<style>
.progressbar {
    width: 50px;
    vertical-align: bottom;
}
.blast-info-container {
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
.blast-info-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap
}
.blast-info-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.blast-info-body-content-container {
    font-size: 1.4em;
}
.blast-info-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.blast-info-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 15px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    color: #1b94e2;
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
    cursor: default;
}
.blast-info-information-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 100%;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
    text-align: center;
}
.blast-info-body-work-container {
    text-align: center;
}
.blast-info-body-work-title-container {
    font-size: 24px;
    width: 100%;
    margin-top: 1em;
    margin-bottom: 0.4em;
}
.blast-info-body-work-list-container {
    border: 1px solid #ffffff;
    width: 100%;
    height: 17em;
    overflow: scroll;
    border-radius: 10px;
    background-color: #ffffff
}
.main-work-list-container {
    width: 100%;
}
.main-work-list-text {
    width: 100%;
    height: 2.0em;
    background-color: #d2ebfa;
    cursor: pointer;
    border-bottom: 1px solid #bbbbbb;
    padding-top: 8px;
    color: #1b94e2;
    font-weight: bold;
    font-size: 1.2em;
}
.main-work-list-title {
    display: inline-block;
    width: 35%;
    text-align: right;
}
.main-work-list-time {
    display: inline-block;
    font-size: 0.8em;
    width: 30%;
}
.main-work-list-progress {
    display: inline-block;
    width: 20%
}
.main-work-list-progress-number {
    display: inline-block;
    font-size: 0.8em;
    width: 15%;
    text-align: left;
}
.supporting-work-list-container {
    width: 100%;
}
.supporting-work-list-text {
    width: 100%;
    height: 2.0em;
    background-color: #d2ebfa;
    cursor: pointer;
    border-bottom: 1px solid #bbbbbb;
    padding-top: 8px;
    color: #1b94e2;
    font-weight: bold;
    font-size: 1.2em;
}
.idle-time-list-container {
    width: 100%;
}
.idle-time-list-text {
    width: 100%;
    height: 2.0em;
    background-color: #d2ebfa;
    cursor: pointer;
    border-bottom: 1px solid #bbbbbb;
    padding-top: 8px;
    color: #1b94e2;
    font-weight: bold;
    font-size: 1.2em;
}
.blast-info-body-work-button-container {
}
.blast-info-body-work-button-add {
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
.blast-info-body-work-button-add.buttonDisabled {
    cursor: not-allowed;
    color: rgb(150, 150, 150, 0.7)
}
.blast-info-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.blast-info-ok-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
    color: #666666;
}
.blast-info-cancle-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
    color: #666666;
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
</style>