<template>
    <div v-if="isType()" id="workAddEditor" class="work-add-container">
        <div v-if="isDataBuild" class="work-add-title-container">
            ADD COMPLETED ACTIVITY
        </div>
        <div v-else class="work-add-title-container">
            ADD ACTIVITY
        </div>
        <div class="work-add-body-container">
                <div class="work-add-body-content-container">
                    <div class="work-add-body-content-title">Category</div>
                    <select id="workType" class="work-add-body-content-message"
                        @change="handleChangeCategory">
                        <option value=0>MAIN WORK</option>
                        <option value=1>SUPPORTING</option>
                        <option value=2>IDLE TIME</option>
                    </select>
                </div>
                <div class="work-add-body-content-container">
                    <div class="work-add-body-content-title">Activity</div>
                    <select id="workKind" class="work-add-body-content-message"
                        @change="handleChangeActivity">
                        <option v-for="(value, key) in activityList" :value="value" :key="key"
                            :disabled="isMainWorkDisabled(value)">{{ key }}</option>
                    </select>
                </div>
                <div v-if="isDataBuild" class="work-add-body-content-container">
                    <div class="work-add-body-content-title">Start Date</div>
                    <input id="workStartTime" type="date" class="work-add-body-content-message"
                        @change="handleChangeWorkStartDate" />
                </div>
                <div v-if="isDataBuild" class="work-add-body-content-container">
                    <div class="work-add-body-content-title">Start Time</div>
                    <input id="workStartTime" type="time" class="work-add-body-content-message"
                        @change="handleChangeWorkStartTime" />
                </div>
                <div v-if="isDataBuild" class="work-add-body-content-container">
                    <div class="work-add-body-content-title">Finish Date</div>
                    <input id="workStartTime" type="date" class="work-add-body-content-message"
                        @change="handleChangeWorkFinishDate" />
                </div>
                <div v-if="isDataBuild" class="work-add-body-content-container">
                    <div class="work-add-body-content-title">Finish Time</div>
                    <input id="workStartTime" type="time" class="work-add-body-content-message"
                        @change="handleChangeWorkFinishTime" />
                </div>
        </div>
        <div class="work-add-button-container">
            <div class="work-add-ok-button"
                @click="handleOkButton">
            OK
            </div>
            <div class="work-add-cancle-button"
                @click="handleCancelButton">
            CANCEL
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'AddWork',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
        blastId: {
            type: String
        }
    },
    data() {
        return {
            isDataBuild: false,
            blastInfo: null,
            category: '0',
            activity: '101',
            tunnelInfo: null,
            startTime: null,
            startDate: null,
            finishTime: null,
            finishDate: null,
            startTimeStamp: null,
            finishTimeStamp: null,
            tmpList: null,
            startTimeCheckState: false,
            finishTimeCheckState: false
        }
    },
    methods: {
        _clearData() {
            this.isDataBuild = false
            this.blastInfo = null,
            this.category = '0',
            this.activity = '101'
            this.tunnelInfo = null;
            this.startTime = null;
            this.startDate = null;
            this.finishTime = null;
            this.finishDate = null;
            this.startTimeStamp = null;
            this.finishTimeStamp = null;
            this.tmpActivity = null;
            this.startTimeCheckState = false;
            this.finishTimeCheckState = false;
        },
        isType() {
            if (this.type == window.CONSTANTS.TYPE.ADD_WORK) {
                if (!!this.blastInfo) {
                    if (this.blastId !== this.blastInfo.id) {
                        this._clearData();
                    }
                }
                this.blastInfo = this.$store.getters.getBlast(this.blastId);
                this.tunnelInfo = this.$store.getters.getTunnel(this.blastInfo.tunnel_id);
                let blast_list = this.tunnelInfo.blast_list,
                    blastIndex = blast_list.findIndex(x => x.id === this.blastId);
                if (blastIndex > 0 &&
                    !!this.blastInfo.blast_info.blasting_time &&
                    !!this.blastInfo.blast_info.blasting_length) {
                    this.isDataBuild = true;
                }
                return true;
            } else {
                return false;
            }
        },
        isMainWorkDisabled(key) {
            let check_obj = this.blastInfo.work_list.find(x => x.typ === parseInt(key));
            if(this.category == 0){
                //check duplicate activity for supporting and idle. not for main activity.
                if (!!check_obj) {
                    return true;
                } else {
                    if(!!!this.tmpActivity) {
                        this.tmpActivity = key;
                    } else {
                        if (this.tmpActivity > key) {
                            this.tmpActivity = key;
                        }
                        this.activity = this.tmpActivity;
                    }
                    return false;
                }
            } else {
                return false
            }
        },
        handleChangeCategory(e) {
            this.tmpActivity = null;
            this.category = e.target.value;
            if (this.category == window.CONSTANTS.CATEGORY.MAIN_WORK) {
                this.activity = '101'
            } else if (this.category == window.CONSTANTS.CATEGORY.SUPPORTING) {
                this.activity = '200'
            } else {
                this.activity = '300'
            }
        },
        handleChangeActivity(e) {
            this.activity = e.target.value;
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
        _startTimeCheck(blast) {
            if (!!this.startTimestamp)  {
                const work_list = blast.work_list;
                if (work_list.length == 0) {
                    if (!!blast.blast_info.blasting_time) {
                        const blasting_time = new Date(blast.blast_info.blasting_time).getTime() / 1000;
                        if (blasting_time > this.startTimestamp) {
                            this.sweetbox.fire("The start time you want to change cannot be less than the blast time. Please reset the time.");
                        } else {
                            this.startTimeCheckState = true;
                        }
                    } else {
                        this.sweetbox.fire("Blast time is not set. Please set the Blast time first and try changing it again.");
                    }
                } else if (work_list.length > 0) {
                    let beforeWorkFinishTime = new Date(work_list[work_list.length - 1].work_history_list[0].timestamp).getTime()/1000;
                    if (this.startTimestamp > beforeWorkFinishTime) {
                        this.startTimeCheckState = true;
                    } else {
                        this.sweetbox.fire("The start time you are trying to enter is less than the finish time of the previous work.  Please check the time again.");
                    }
                }
            } else {
                this.sweetbox.fire("Start time not entered. Please check again.");
            }
        },
        _finishTimeCheck(blast) {
            if (!!this.finishTimestamp) {
                if (this.finishTimestamp > this.startTimestamp) {
                    let blast_list = this.tunnelInfo.blast_list,
                        blastIndex = blast_list.findIndex(x => x.id === this.blastId),
                        work_list = blast.work_list,
                        nextBlastingTime = new Date(blast_list[blastIndex - 1].blast_info.blasting_time).getTime()/1000
                    if (this.finishTimestamp > nextBlastingTime) {
                        this.sweetbox.fire("The finish time you are trying to change cannot be greater than the next blast time. Please check the time again.");
                    } else {
                        this.finishTimeCheckState = true;
                    }
                } else {
                    this.sweetbox.fire("The finish time you want to change cannot be less than the start time. Please reset the finish time.")
                }
            } else {
                this.sweetbox.fire("Finish time not entered. Please check again.");
            }
        },
        handleOkButton() {
            let data = {
                blastId: this.blastId,
                activity: this.activity,
                category: this.category
            }
            if (!!this.isDataBuild) {
                let blast = this.blastInfo;
                data.start_time = this.startTimestamp;
                data.finish_time = this.finishTimestamp;
                data.is_data_build = this.isDataBuild;
                this._startTimeCheck(blast);
                this._finishTimeCheck(blast);
                if (this.startTimeCheckState && this.finishTimeCheckState) {
                    this.$emit('select-ok-button', data);
                    this.isDataBuild = false;
                    this._clearData();
                }
            } else {
                this.$emit('select-ok-button', data);
                this.isDataBuild = false;
                this._clearData();
            }
        },
        handleCancelButton() {
            let blast = this.$store.getters.getBlast(this.blastId);
            this.$emit('select-cancel-button', blast);
            if (!!this.isDataBuild) {
                this.isDataBuild = false;
            }
            this._clearData();
        }
    },
    computed: {
        activityList() {
            if (this.category == window.CONSTANTS.CATEGORY.MAIN_WORK) {
                return window.CONSTANTS.MAIN_WORK;
            } else if (this.category == window.CONSTANTS.CATEGORY.SUPPORTING) {
                return window.CONSTANTS.SUPPORTING_WORK;
            } else {
                return window.CONSTANTS.IDEL_TIME;
            }
        }
    },
    created() {
    }
}
</script>
<style>
.work-add-container {
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
.work-add-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
}
.work-add-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.work-add-body-content-container {
    font-size: 1.4em;
}
.work-add-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.work-add-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 15px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
    color: #1b94e2;
}

.work-add-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.work-add-ok-button {
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
.work-add-cancle-button {
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
</style>