<template>
    <div id="workEditor" class="work-info-container">
      <div class="work-editor-title-container">
        Work Info
      </div>
      <div class="work-editor-body-container">
        <div>Work Data List
            <select id="workData" v-model="selectWorkData" >
                <option v-for="work in workDataList" v-bind:value="work">
                  {{ work.name }}
                </option>
            </select>
        </div>
        <div>name
          <input id=workName type="text" class="ga-name-input"
              :value="getWorkName" maxlength="30" @change="handleChangeWorkName" />
        </div>
        <div>Work Kind
            <select id="workKind" v-model="workKind">
                <option v-for="(value, name) in workKinds">
                  {{ name }}
                </option>
            </select>
        </div>
        <div>Work State
          <input id=workState type="text" class="ga-name-input"
              :value="getWorkState" maxlength="30" disabled/>
        </div>
        <div>start time
          <input id=workStartTime type="datetime-local" class="ga-name-input"
              :value="getStartTime"
              @change="handleChangeWorkStartTime" />
        </div>
        <div>finish time
          <input id=workFinishTime type="datetime-local" class="ga-name-input"
              :value="getFinishTime"
              @change="handleChangeWorkFinishTime" />
        </div>
        <div class="work-editor-ok-button"
            @click="handleStartWork">
          start work
        </div>
        <div class="work-editor-cancel-button"
           @click="handleStopWork">
          stop work
        </div>
        <div class="work-editor-cancel-button"
            @click="handleFinishWork">
          finish work
        </div>
        <div class="work-editor-cancel-button"
            @click="handleRemoveWork">
          remove work
        </div>
      </div>
      <div class="work-editor-button-container">
        <div class="work-editor-ok-button"
            @click="handleOkButton">
          OK
        </div>
        <div class="work-editor-cancel-button"
            @click="handleCancelButton">
          CANCEL
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
          workKind: null,
          workKinds: window.CONSTANTS.WORK_KIND,
          workDataList: [],
          selectWorkData: null
        }
    },
    methods: {
      handleOkButton() {
          const data = {};
          if (!!this.selectWorkData) {
              data.id = this.selectWorkData.id;
              if (!!!this.workKind) {
                 data.work_kind = this.selectWorkData.work_kind;
              } else {
                 data.work_kind = window.CONSTANTS.WORK_KIND[this.workKind];
              }
          } else {
              if (!!!this.workKind) {
                  data.work_kind = this.workKind;
              } else {
                  data.work_kind = window.CONSTANTS.WORK_KIND[this.workKind];
              }
          }
          data.name = this.workName;
          data.start_time = this.startTime;
          data.finish_time = this.finishTime;
          data.prog_id = this.progressId;
          this.$emit('select-ok-button', data);
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
          var finishTime = new Date(e.target.value).getTime();
          this.finishTime = finishTime/1000;
      },
      handleStartWork() {
          const data = {};
          if (!!this.selectWorkData) {
              data._id = this.selectWorkData.id;
              data.work_state = window.CONSTANTS.WORK_STATE.START;
              this.$emit('select-handle-work-button', data);
          } else {
              this.sweetbox.fire("there is no work data for start")
          }
      },
      handleStopWork() {
          const data = {};
          if (!!this.selectWorkData) {
              data._id = this.selectWorkData.id;
              data.work_state = window.CONSTANTS.WORK_STATE.STOP;
              this.$emit('select-handle-work-button', data);
          } else {
              this.sweetbox.fire("there is no work data for stop")
          }
      },
      handleFinishWork() {
          const data = {};
          if (!!this.selectWorkData) {
              data._id = this.selectWorkData.id;
              data.work_state = window.CONSTANTS.WORK_STATE.FINISH;
              this.$emit('select-handle-work-button', data);
          } else {
              this.sweetbox.fire("there is no work data for finish")
          }
      },
      handleRemoveWork() {
          const data = {};
          if (!!this.selectWorkData) {
              data.id = this.selectWorkData.id;
              this.$emit('select-remove-work-button', data);
          } else {
              this.sweetbox.fire("there is no work data for remove")
          }
      }
    },
    computed: {
        getWorkName() {
            if (this.selectWorkData) {
                return this.selectWorkData.name;
            } else {
                return this.workName;
            }
        },
        getWorkState() {
            if (this.selectWorkData) {
                return this.selectWorkData.work_state_name;
            } else {
                return null;
            }
        },
        getStartTime() {
            if (this.selectWorkData) {
                if (!!this.selectWorkData.start_time) {
                    var finishTimeStamp = new Date(this.selectWorkData.finish_time*1000);
                    var timeArray = finishTimeStamp.toISOString().split(":");
                    return timeArray[0]+":"+timeArray[1];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        },
        getFinishTime() {
            if (this.selectWorkData) {
                if (!!this.selectWorkData.finish_time) {
                    var startTimeStamp = new Date(this.selectWorkData.start_time*1000);
                    var timeArray = startTimeStamp.toISOString().split(":");
                    return timeArray[0]+":"+timeArray[1];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    },
    created() {
        const workList = this.$store.getters.getWorkList;
        this._.forEach(workList, (workData) => {
            if (workData.prog_id == this.progressId) {
                this.workDataList.push(workData);
            }
        });
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
}
.work-editor-title-container {
  width: 100%;
  height: 10%;
  text-align: center;
}
.work-editor-body-container {
  width: 100%;
  height: 80%;
}
.work-editor-button-container {
  width: 100%;
  height: 10%;
  text-align: center;
}
.work-editor-ok-button {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  border: 1px solid;
  font-size: 20px;
}
.work-editor-cancel-button {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  border: 1px solid;
  font-size: 20px;
}
</style>