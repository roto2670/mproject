<template>
    <div v-if="isType()">
        <div id="blastInfoEditor" class="blast-info-container">
            <div class='panel-close-button' @click="handleCloseButton"></div>
            <div class="blast-info-title-container">
                Work Information
            </div>
            <div class="blast-info-body-container">
                <div class="blast-info-body-content-container">
                    <div class="blast-info-body-content-title">Excavt. ID</div>
                    <input class="blast-info-body-content-message" type="text"
                        :value="getTunnelId" readonly>
                </div>
                <div class="blast-info-body-content-container">
                    <div class="blast-info-body-content-title">Status</div>
                    <input class="blast-info-body-content-message" type="text"
                        :value="getWorkState" readonly>
                </div>
                <div class="blast-info-body-content-container line">
                    <div class="blast-info-body-content-title">Cycle Time</div>
                    <input class="blast-info-body-content-message" type="text"
                        :value="getTotalTime" readonly>
                </div>
                <!-- <div class="blast-info-body-content-container">
                    <div class="blast-info-information-button"
                        @click="handleInformationButton">
                    Blast Information
                    </div>
                </div> -->
                <div class="blast-info-information-container">
                    <div class="b-detail-title-container" @click="handleCycleDetail">
                        <div class="detail-title">Cycle Time Detail </div>
                        <div class="button-image position" :class="{ down : isCycleDetailClose }"></div>
                    </div>
                    <div id="detailInfo" class="detail-container" :class="{ close: isCycleDetailClose }">
                        <div class="blast-info-body-work-container">
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

                    <div class="blast-info-information-container">
                        <div class="b-detail-title-container" @click="handleBlastingDetail">
                            <div class="detail-title">Blasting Detail </div>
                            <div class="button-image position" :class="{ down : isBlastingDetailClose }"></div>
                        </div>
                        <div id="detailInfo" class="detail-container" :class="{ close: isBlastingDetailClose }">
                            <div v-if="isEdit">
                                <!-- isEdit = true -->

                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Blasting Date</div>
                                    <input class="blast-info-body-content-message fold" type="date"
                                        @change="handleChangeBlastingDate"
                                        :value="getBlastingDateEdit">
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Blasting Time</div>
                                    <input class="blast-info-body-content-message fold" type="time"
                                        @change="handleChangeBlastingTime"
                                        :value="getBlastingTimeEdit">
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Start Point (m)</div>
                                    <input class="blast-info-body-content-message fold" type="Number"
                                        :value="getStartPointEdit" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">End Point (m)</div>
                                    <input class="blast-info-body-content-message fold" type="number"
                                        @change="handleChangeFinishPoint"
                                        step="0.1" :value="getFinishPointEdit">
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Drilling Length (m)</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getLengthEdit" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Explosive Bulk (kg)</div>
                                    <input class="blast-info-body-content-message fold" type="number"
                                        @change="handleChangeExplosiveBulk"
                                        :value="getExplosiveBulkEdit">
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Explosive Cartridge (kg)</div>
                                    <input class="blast-info-body-content-message fold" type="number"
                                        @change="handleChangeExplosiveCartridge"
                                        :value="getExplosiveCartridgeEdit">
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Detonator (kg)</div>
                                    <input class="blast-info-body-content-message fold" type="Number"
                                        @change="handleChangeDetonator"
                                        :value="getDetonatorEdit">
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Drilling Depth (m)</div>
                                    <input class="blast-info-body-content-message fold" type="Number"
                                        @change="handleChangeDrillingDepth"
                                        step="0.1" :value="getDrillingDepthEdit">
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Charging Team</div>
                                    <select class="blast-info-body-content-message fold"
                                        @change="handleChangeTeamId">
                                        <option disabled :selected="isSelectedTeam(null)">Select Team</option>
                                        <option v-for="value in getTeamEdit" :value="value.id" :key="value.id"
                                            :selected="isSelectedTeam(value)">
                                            {{ value.name }}
                                        </option>
                                    </select>
                                    <input class="blast-info-body-content-message fold sub" type="number"
                                        @change="handleChangeTeamNos"
                                        :value="getTeamNosEdit">
                                </div>


                                <div class="blast-info-button-container">
                                    <div class="blast-info-ok-button"
                                        @click="handleOkButton">
                                    SAVE
                                    </div>
                                    <div class="blast-info-cancle-button"
                                        @click="handleCancelButton">
                                    CANCEL
                                    </div>
                                </div>
                            </div>
                            <div v-else>
                                <!-- isEdit = false -->
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Blasting Date</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getBlastingDate" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Blasting Time</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getBlastingTime" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Start Point</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getStartPoint" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">End Point</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getFinishPoint" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Drilling Length</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getLength" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Explosive Bulk</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getExplosiveBulk" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Explosive Cartridge</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getExplosiveCartridge" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Detonator</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getDetonator" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Drilling Depth</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getDrillingDepth" readonly>
                                </div>
                                <div class="blast-info-body-content-container fold">
                                    <div class="blast-info-body-content-title fold">Charging Team</div>
                                    <input class="blast-info-body-content-message fold" type="text"
                                        :value="getTeam" readonly>
                                    <input class="blast-info-body-content-message fold sub" type="text"
                                        :value="getTeamNos" readonly>
                                </div>
                                <div class="blast-info-button-container">
                                    <div class="blast-info-edit-button"
                                        @click="handleEditButton">
                                    EDIT
                                    </div>
                                    <div class="blast-info-edit-button"
                                        @click="handleRemoveButton">
                                    REMOVE
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> <!-- Blasting detail -->

                </div> <!-- Cycle time detail-->
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
            blastDate: "",
            blastTime: "",
            blastInformation: null,
            isCycleDetailClose: true,
            isBlastingDetailClose: true,
            blastingLength: 0,
            explosive_bulk: 0,
            explosive_cartridge: 0,
            detonator: 0,
            drilling_depth: 0,
            blasting_time: null,
            start_point: 0,
            finish_point: 0,
            team_id: 0,
            team_nos: 0
        }
    },
    methods: {
        _clearData() {
            this.isEdit = false;
            this.isFinish = false;
            this.blastName = '';
            this.blast = null;
            this.tunnel = null;
            this.blastDate = "";
            this.blastTime = "";
            this.blastInformation = null;
            this.blastingLength = 0;
            this.isCycleDetailClose = true;
            this.isBlastingDetailClose = true;
            this.explosive_bulk = 0;
            this.explosive_cartridge = 0;
            this.detonator = 0;
            this.drilling_depth = 0;
            this.blasting_time = null;
            this.start_point = 0;
            this.finish_point = 0;
            this.team_id = 0;
            this.team_nos= 0;
        },
        isType() {
            if (this.type == window.CONSTANTS.TYPE.SELECT_BLAST) {
                this.blast = this.$store.getters.getBlast(this.id);
                this.blastInformation = this.blast.blast_info;
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
        handleOkButton() {
            let blastList = this.tunnel.blast_list,
                index = blastList.findIndex(x => x.id === this.id),
                changedTime = new Date(this.blasting_time).getTime() / 1000,
                data = {};
            data.explosive_bulk = this.explosive_bulk;
            data.explosive_cartridge = this.explosive_cartridge;
            data.detonator = this.detonator;
            data.drilling_depth = this.drilling_depth;
            data.start_point = this.start_point;
            data.finish_point = this.finish_point;
            data.blasting_length = this.blastingLength;
            data.team_id = this.team_id;
            data.team_nos = this.team_nos;
            data.blast_id = this.id;
            data.id = this.blastInformation.id;
            if (blastList.length == 1) {
                this._okButton(data);
            } else if (blastList.length > 1) {
                if (index == 0) {
                    let beforeFinishTime = 0;
                    if (!!blastList[index + 1]){
                        if (blastList[index + 1].work_list.length !== 0) {
                            beforeFinishTime = new Date(blastList[index + 1].work_list[0].work_history_list[0].timestamp).getTime()/1000
                        } else {
                            beforeFinishTime = new Date(blastList[index + 1].blast_info.blasting_time).getTime()/1000
                        }
                    }
                    if (changedTime < beforeFinishTime) {
                        this.sweetbox.fire("The time you are trying to change is less than the end time of the previous blasting. Please check the time again.");
                    } else {
                        this._okButton(data);
                    }
                } else if (index == blastList.length - 1) {
                    const nextStartTime = new Date(blastList[index - 1].blast_info.blasting_time).getTime() / 1000;
                    if(!!nextStartTime){
                        if (changedTime > nextStartTime) {
                            this.sweetbox.fire("The time you are trying to change is greater than the start time of the next blasting . Please check the time again.");
                        } else {
                            this._okButton(data);
                        }
                    } else {
                        this._okButton(data);
                    }
                } else {
                    let beforeFinishTime = 0,
                        nextStartTime = new Date(blastList[index - 1].blast_info.blasting_time).getTime() / 1000;
                    if (blastList[index + 1].work_list.length !== 0) {
                            beforeFinishTime = new Date(blastList[index + 1].work_list[0].work_history_list[0].timestamp).getTime()/1000
                        } else {
                            beforeFinishTime = new Date(blastList[index + 1].blast_info.blasting_time).getTime()/1000
                        }
                    if (changedTime < beforeFinishTime) {
                        this.sweetbox.fire("The time you are trying to change is less than the end time of the previous blasting. Please check the time again.");
                    } else {
                        if(!!nextStartTime){
                            if (changedTime > nextStartTime) {
                                this.sweetbox.fire("The time you are trying to change is greater than the start time of the next blasting . Please check the time again.");
                            } else {
                                this._okButton(data);
                            }
                        } else {
                            this._okButton(data);
                        }
                    }
                }
            }
        },
        _okButton(data) {
            if (data.blasting_length > 0) {
                data.blasting_time = this.blasting_time;
                this.$emit('select-ok-button', data, this.tunnel, this.blast);
                this._clearData();
                this.isEdit = false;
            } else {
                this.sweetbox.fire("The length you are trying to change cannot be 0 or minus length. Please check the Finish point and Blasing Length.");
            }
        },
        handleCancelButton() {
            this.isEdit = false;
            this.$emit('select-edit-blast-cancel-button');
            this.isBlastingDetailClose = false;
        },
        handleCloseButton() {
            this.$emit('select-close-button', {});
            this._clearData();
        },
        handleEditButton() {
            this.isEdit = true;
            this.$emit('select-edit-blast-button', this.tunnel, this.id);
        },
        handleRemoveButton() {
            let data = {},
                blastList = this.tunnel.blast_list,
                index = blastList.findIndex(x => x.id === this.id);
            data.blast_id = this.id;
            if (index == 0) {
                this.services.getWorkListByBlast(data, (resData) => {
                    if (resData.length == 0) {
                        this.$emit('select-remove-blast-button', this.id);
                    } else {
                        this.sweetbox.fire("Deletion not possible because child data exists.");
                    }
                });
            } else {
                this.sweetbox.fire("Not the latest Blast data. Please delete the latest Blast data sequentially.");
            }
        },
        handleAddWorkButton() {
            if (!this.isFinish) {
                this.$emit('select-add-work-button', this.id);
                this._clearData();
            }
        },
        handleSelectWorkItem(workId) {
            this.$emit("select-work-item", workId);
            this._clearData();
        },
        handleCycleDetail() {
            this.isCycleDetailClose = !this.isCycleDetailClose;
        },
        handleBlastingDetail() {
            this.isBlastingDetailClose = !this.isBlastingDetailClose;
        },
        isSelectedTeam(value) {
            return this.blastInformation.team_id == value;
        },
        handleChangeExplosiveBulk(e) {
            this.explosive_bulk = e.target.value;
        },
        handleChangeExplosiveCartridge(e) {
            this.explosive_cartridge = e.target.value;
        },
        handleChangeDetonator(e) {
            this.detonator = e.target.value;
        },
        handleChangeDrillingDepth(e) {
            this.drilling_depth = parseInt(e.target.value);
        },
        handleChangeBlastingDate(e) {
            this.blastDate = e.target.value;
            this.blasting_time = this.blastDate + " " + this.blastTime;
        },
        handleChangeBlastingTime(e) {
            this.blastTime = e.target.value;
            this.blasting_time = this.blastDate + " " + this.blastTime;
        },
        handleChangeFinishPoint(e) {
            let blastList = this.tunnel.blast_list,
                _finish_point = parseFloat(e.target.value),
                index = blastList.findIndex(x => x.id === this.id);
            this.finish_point = _finish_point;
            this.blastingLength = this.finish_point - this.start_point;
            if (_finish_point > this.start_point) {
                if (index > 0) {
                    this.sweetbox.fire("The length cannot be changed because more recent blasts exist. Please delete the latest blasts and change the length.");
                } else {
                    this.$emit('change-blast-length', this.tunnel, this.blastingLength, this.id);
                }
            } else {
                this.sweetbox.fire("The length you want to change cannot be 0 or minus length. Please reset the finish point.");
            }
        },
        handleChangeTeamId(e) {
            this.team_id = e.target.value;
        },
        handleChangeTeamNos(e) {
            this.team_nos = e.target.value;
        },
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
            let tunnelID = this.tunnel.tunnel_id;
            if (this.tunnel.blast_list.length > 0) {
                let blastInfo = this.tunnel.blast_list[0].blast_info;
                tunnelID += "_CH." + blastInfo.start_point.toFixed(1)
                    + '~CH.' + blastInfo.finish_point.toFixed(1);
            }
            return tunnelID;
        },
        getWorkState() {
            if (this.tunnel.blast_list.length > 0) {
                return window.CONSTANTS.WORK_STATE_NAME[this.tunnel.blast_list[0].state];
            } else {
                // Not Started
                return window.CONSTANTS.WORK_STATE_NAME[0];
            }
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
        getExplosiveBulk() {
            this.explosive_bulk = this.blastInformation.explosive_bulk;
            if (!!!this.explosive_bulk) {
                this.explosive_bulk = 0;
            }
            return this.explosive_bulk + ' kg';
        },
        getExplosiveBulkEdit() {
            return this.explosive_bulk;
        },
        getExplosiveCartridge() {
            this.explosive_cartridge = this.blastInformation.explosive_cartridge;
            if (!!!this.explosive_cartridge) {
                this.explosive_cartridge = 0;
            }
            return this.explosive_cartridge + ' kg';
        },
        getExplosiveCartridgeEdit() {
            return this.explosive_cartridge;
        },
        getDetonator() {
            this.detonator = this.blastInformation.detonator;
            return this.detonator + ' Nos';
        },
        getDetonatorEdit() {
            return this.detonator;
        },
        getDrillingDepth() {
            this.drilling_depth = this.blastInformation.drilling_depth;
            return this.drilling_depth.toFixed(1) + 'm';
        },
        getDrillingDepthEdit() {
            return this.drilling_depth.toFixed(1);
        },
        getBlastingDate() {
            if (this.blastInformation.blasting_time != null) {
                this.blastDate = this.blastInformation.blasting_time.split(' ')[0];
            } else {
                this.blastDate = this.blastInformation.blasting_time;
            }
            if (this.blastDate !== null && this.blastTime != null) {
                this.blasting_time = this.blastDate + " " + this.blastTime;
            } else {
                this.blasting_time = null;
            }
            return this.blastDate;
        },
        getBlastingDateEdit() {
            return this.blastDate;
        },
        getBlastingTime() {
            if (this.blastInformation.blasting_time !== null) {
                this.blastTime = this.blastInformation.blasting_time.split(' ')[1];
                this.blastTime = this.blastTime.substring(0,5);
            } else {
                this.blastTime = this.blastInformation.blasting_time;
            }
            if (this.blastDate !== null && this.blastTime != null) {
                this.blasting_time = this.blastDate + " " + this.blastTime;
            } else {
                this.blasting_time = null;
            }
            return this.blastTime;
        },
        getBlastingTimeEdit(){
            return this.blastTime;
        },
        getStartPoint() {
            this.start_point = this.blastInformation.start_point;
            return this.start_point.toFixed(1) + "m";
        },
        getStartPointEdit() {
            return this.start_point.toFixed(1);
        },
        getFinishPoint() {
            this.finish_point = this.blastInformation.finish_point;
            return this.finish_point.toFixed(1) + 'm';
        },
        getFinishPointEdit() {
            return this.finish_point.toFixed(1);
        },
        getLength() {
            this.blastingLength = this.finish_point - this.start_point;
            return this.blastingLength.toFixed(1) + 'm';
        },
        getLengthEdit() {
            return this.blastingLength.toFixed(1);
        },
        getTeam() {
            let teamId = this.blastInformation.team_id,
                teamInfo = this.$store.getters.getTeam(teamId);
            if (teamInfo) {
                return teamInfo.name;
            } else {
                return "Not Selected Team";
            }
        },
        getTeamEdit() {
            return this.$store.getters.getTeamList();
        },
        getTeamNos() {
            if (this.blastInformation.team_nos) {
                return this.blastInformation.team_nos + ' Nos';
            } else {
                return "0 Nos";
            }
        },
        getTeamNosEdit() {
            return this.blastInformation.team_nos;
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
    height: 85%;
    padding: 1em;
    overflow-y: scroll;
}
.blast-info-body-content-container {
    font-size: 1.4em;
}
.blast-info-body-content-container.fold {
    text-align: right;
    margin-bottom: 6px;
}
.blast-info-body-content-container.line {
    border-bottom: 2px solid #fefefe;
    margin-bottom: 10px;
}
.blast-info-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.blast-info-body-content-title.fold {
    width: 40%;
    font-size: 13px;
    text-align: left;
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
.blast-info-body-content-message.fold {
    width: 55%;
    font-size: 13px;
    padding-left: 14px;
}
.blast-info-body-content-message.sub {
    margin-left: 30%;
    margin-bottom: 0.7em;
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
.blast-info-body-work-list-container {
    border: 1px solid #ffffff;
    width: 90%;
    height: 17em;
    overflow: scroll;
    border-radius: 10px;
    background-color: #ffffff;
    margin-top: 0.4em;
    margin-left: 25px;
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
    font-size: 0.8em;
}
.main-work-list-time {
    display: inline-block;
    font-size: 0.7em;
    width: 30%;
}
.main-work-list-progress {
    display: inline-block;
    width: 20%
}
.main-work-list-progress-number {
    display: inline-block;
    font-size: 0.7em;
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
    margin: 5px 5px 5px 15px;
    padding: 5px;
    font-size: 14px;
    cursor: pointer;
    width: 12em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
}
.blast-info-body-work-button-add.buttonDisabled {
    cursor: not-allowed;
    color: rgb(150, 150, 150, 0.7)
}
.blast-info-button-container {
    width: 100%;
    height: 5%;
    text-align: center;
}
.blast-info-ok-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 5em;
    height: 1.8em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
}
.blast-info-cancle-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 5em;
    height: 1.8em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
}
.blast-info-edit-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 10em;
    height: 1.8em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
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

.blast-info-information-container {
    width: 100%;
    height: 2em;
    text-align: center;
}
.b-detail-title-container {
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

</style>