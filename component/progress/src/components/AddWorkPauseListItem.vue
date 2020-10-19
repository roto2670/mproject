<template>
    <div v-if="isOpen" id="addWorkPauseListItem" class="add-work-pause-list-item-container">
        <div class="add-work-pause-background"></div>
        <div class="add-work-pause-selectbox">
            <div class="add-work-pause-title-container">
                <div class="add-work-pause-title-message">
                    Please select the reason
                </div>
            </div>
            <div class="add-work-pause-select-container">
                <div class="pause-body-content-title">Message</div>
                <select class="add-work-pause-select-box"
                    @change="handleChangeReason">
                    <option disabled selected>Please select the reason</option>
                    <option v-for="message in messageList" :value="message.message" :key="message.message">
                        {{ message.message }}
                    </option>
                </select>
            </div>
            <div class="add-work-pause-select-container">
                <div class="pause-body-content-title">Start date</div>
                <input id="pauseStartDate" type="date" class="pause-body-content-message"
                    @change="handleChangPauseStartDate" />
            </div>
            <div class="add-work-pause-select-container">
                <div class="pause-body-content-title">Start time</div>
                <input id="pauseStartTime" type="time" class="pause-body-content-message"
                    @change="handleChangePauseStartTime"/>
            </div>
            <div class="add-work-pause-select-container">
                <div class="pause-body-content-title">end date</div>
                <input id="pauseFinishDate" type="date" class="pause-body-content-message"
                    @change="handleChangePauseFinishDate" />
            </div>
            <div class="add-work-pause-select-container">
                <div class="pause-body-content-title">end time</div>
                <input id="pauseFinishTime" type="time" class="pause-body-content-message"
                    @change="handleChangePauseFinishTime" />
            </div>
            <div class="add-work-pause-button-container">
                <div class="add-work-pause-button add"
                    @click="handleAddButton">
                    Add
                </div>
                <div class="add-work-pause-button cancel"
                    @click="handleCancleButton">
                    Cancel
                </div>
            </div>
        </div>
    </div>

</template>
<script>
export default {
    name: 'addWorkPauseListItem',
    components: {
    },
    props: {
        isOpen: {
            type: Boolean,
            default: false
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
            if (!!data.start_time && !!data.end_time && data.message) {
                this.$emit('select-add-button', data);
                this._handleClear();
            } else if (!!!data.start_time) {
                this.sweetbox.fire("You have not entered an start time. Please enter an start time.");
            } else if (!!!data.end_time) {
                this.sweetbox.fire("You have not entered an end time. Please enter an end time.");
            } else if (!!!data.message) {
                this.sweetbox.fire("No reason selected. Please select a reason message.");
            }
        },
        handleCancleButton() {
            this.$emit('select-cancel-button', {});
            this._handleClear();
        }
    },
    computed: {
    },
    created() {
    }
}
</script>
<style>
.add-work-pause-list-item-container {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 10;
}
.add-work-pause-background {
    width: 100%;
    height: 100%;
    position: absolute;
    opacity: 0.4;
    background-color: #000000;
}
.add-work-pause-selectbox {
    width: 400px;
    height: 400px;
    position: absolute;
    background-color: #ffffff;
    top: 30%;
    left: 30%;
    text-align: center;
    border-radius: 4px;
}
.add-work-pause-title-container {
    width: 100%;
    height: 20%;
}
.add-work-pause-title-message {
    width: 100%;
    font-size: 1.8em;
    padding: 0.5em 0.1em 0.5em 0.1em;
    color: #595959;
    font-size: 1.475em;
    font-weight: 600;
    text-align: center;
    text-transform: none;
}
.add-work-pause-select-container {
    width: 100%;
    height: 12%;
}
.pause-body-content-title {
    width: 25%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.pause-body-content-message {
    width: 60%;
    font-size: 1.0em;
    color: #595959;
    margin: 0.5em;
    padding: .375em .625em;
    box-sizing: border-box;
    display: inline-block
}
.add-work-pause-select-box {
    width: 60%;
    padding: .375em .625em;
    margin: 0.5em;
    background: inherit;
    font-size: 1.0em;
}
.add-work-pause-date {
    width: 70%;
    padding: .375em .625em;
    margin: 0.5em;
    font-size: 1.0em;
}
.add-work-pause-button-container {
    width: 100%;
    height: 25%;
}
.add-work-pause-button {
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
.add-work-pause-button.add {
    background-color: #3085d6;
}
.add-work-pause-button.cancel {
    background-color: #aaa;
}
</style>