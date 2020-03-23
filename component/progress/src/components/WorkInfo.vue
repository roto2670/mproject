<template>
    <div v-if="isType()">
        <div id="workInfoEditor" class="work-info-container">
        <div class="work-info-title-container">
            Work Info
        </div>
        <div class="work-info-body-container">
            <div class="work-info-body-content-container">
                <div class="work-info-body-content-title">Name</div>
                <input type="text" class="work-info-body-content-message"
                    :value="getWorkName" maxLength="30" @change="handleChangeWorkName" disabled>
            </div>
            <div class="work-info-body-content-container">
                <div class="work-info-body-content-title">Type</div>
                <select id="workType" class="work-info-body-content-message">
                </select>
            </div>
            <div class="work-info-body-content-container">
                <div class="work-info-body-content-title">Kind</div>
                <select id="workKind" class="work-info-body-content-message">
                </select>
            </div>
            <div class="work-info-body-content-container">
                <div class="work-info-body-content-title">State</div>
                <input id="workState" type="text" class="work-info-body-content-message"
                    :value="getWorkState" maxlength="30" disabled/>
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

            <div class="work-info-body-button-container">
                <div class="work-info-body-button"
                    @click="handleStartWork">Start</div>
                <div class="work-info-body-button"
                    @click="handleStopWork">Stop</div>
                <div class="work-info-body-button"
                    @click="handleFinishWork">Finish</div>
                <div class="work-info-body-button"
                    @click="handleRemoveWork">Remove</div>
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
    </div>
</template>
<script>
export default {
    name: 'WorkInfo',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
        id: {
          type: String
        },
        progressId: {
          type: String
        }
    },
    data() {
        return {
          workName: '',
          startTime: null,
          finishTime: null,
          workInfo: null
        }
    },
    methods: {
         isType() {
             if (this.type == window.CONSTANTS.TYPE.SELECT_WORK) {
                this.workInfo = this.$store.getters.getWork(this.id);
                return true;
             } else {
                 return false;
             }
         },
        handleOkButton() {
            this.workInfo.name = this.workName;
            this.workInfo.start_time = this.startTime;
            this.workInfo.finish_time = this.finishTime;
            this.$emit('select-ok-button', this.workInfo);
        },
        handleCancelButton() {
            this.$emit('select-cancel-button', {});
        },
        handleAddWorkButton() {
            this.$emit('select-add-work-button', this.id);
        },
        handleChangeWorkName(e) {
            this.workName = e.target.value;
        },
        handleChangeWorkStartTime (e) {
            var startTime = new Date(e.target.value).getTime();
            this.startTime = startTime/1000
        },
        handleChangeWorkFinishTime (e) {
            console.log("ddd : ", e.target.value)
            var finishTime = new Date(e.target.value).getTime();
            this.finishTime = finishTime/1000;
        },
        handleStartWork() {
            const data = {};
            if (!!this.workInfo) {
                data._id = this.workInfo.id;
                data.work_state = window.CONSTANTS.WORK_STATE.START;
                this.$emit('select-handle-work-button', data);
            } else {
                this.sweetbox.fire("there is no work data for start")
            }
        },
        handleStopWork() {
            const data = {};
            if (!!this.workInfo) {
                data._id = this.workInfo.id;
                data.work_state = window.CONSTANTS.WORK_STATE.STOP;
                this.$emit('select-handle-work-button', data);
            } else {
                this.sweetbox.fire("there is no work data for stop")
            }
        },
        handleFinishWork() {
            const data = {};
            if (!!this.workInfo) {
                data._id = this.workInfo.id;
                data.work_state = window.CONSTANTS.WORK_STATE.FINISH;
                this.$emit('select-handle-work-button', data);
            } else {
                this.sweetbox.fire("there is no work data for finish")
            }
        },
        handleRemoveWork() {
            const data = {};
            if (!!this.workInfo) {
                data.id = this.workInfo.id;
                this.$emit('select-remove-work-button', data);
            } else {
                this.sweetbox.fire("there is no work data for remove")
            }
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
        getWorkName() {
            this.workName = this.workInfo.name;
            return this.workName;
        },
        getWorkState() {
            return this.workInfo.work_state;
        },
        getFinishTime() {
            var finishTime = new Date(this.workInfo.finish_time*1000),
                date = this.formatDate(finishTime),
                time = finishTime.toTimeString().split(" ")[0],
                ret = date+"T"+time;
            return ret;
        },
        getStartTime() {
            var startTime = new Date(this.workInfo.start_time*1000),
                date = this.formatDate(startTime),
                time = startTime.toTimeString().split(" ")[0],
                ret = date+"T"+time;
            return ret;
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
    background-color: #5ab762;
    cursor: default;
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
    height: 75%;
    padding: 1em;
}
.work-info-body-content-container {
    font-size: 1.4em;
}
.work-info-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 18px;
    display: inline-block;
}
.work-info-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 18px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
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
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
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
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
}
.work-info-cancel-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;;
}
</style>