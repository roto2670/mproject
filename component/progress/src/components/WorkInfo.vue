<template>
    <div id="workEditor" class="work-info-container">
      <div class="work-editor-title-container">
        Work Info
      </div>
      <div class="work-editor-body-container">
        <div>type</div>
        <div>name
          <input id=workName type="text" class="ga-name-input"
              maxlength="30" @change="handleChangeWorkName" />
        </div>
        <div>Work Kind
            <select id="cars" v-model="workKind">
                <option v-for="(value, name) in options">
                  {{ name }}
                </option>
            </select>
        </div>
        <div>start time
          <input id=workStartTime type="datetime-local" class="ga-name-input"
              @change="handleChangeWorkStartTime" />
        </div>
        <div>finish time
          <input id=workFinishTime type="datetime-local" class="ga-name-input"
              @change="handleChangeWorkFinishTime" />
        </div>
      </div>
      <div class="work-editor-button-container">
        <div class="work-editor-ok-button"
            @click="handleOkButton">
          OK
        </div>
        <div class="work-editor-cancle-button"
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
          startTime: '',
          finishTime: '',
          workKind: '',
          options: window.CONSTANTS.WORK_KIND
        }
    },
    methods: {
      handleOkButton() {
          const data = {};
          data.name = this.workName;
          data.start_time = this.startTime;
          data.finish_time = this.finishTime;
          data.prog_id = this.progressId;
          data.work_kind = window.CONSTANTS.WORK_KIND[this.workKind];
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
      }
    },
    computed: {
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
.work-editor-cancle-button {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  border: 1px solid;
  font-size: 20px;
}
</style>