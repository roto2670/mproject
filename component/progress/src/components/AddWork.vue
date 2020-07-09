<template>
    <div v-if="isType()" id="workAddEditor" class="work-add-container">
        <div class="work-add-title-container">
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
            blastInfo: null,
            category : '0',
            activity : '101',
        }
    },
    methods: {
      _clearData() {
          this.blastInfo = null,
          this.category = '0',
          this.activity = '101'
      },
      isType() {
          this.blastInfo = this.$store.getters.getBlast(this.blastId);
          return this.type == window.CONSTANTS.TYPE.ADD_WORK;
      },
      isMainWorkDisabled(key) {
          if (this.category == '0') {
              return false;
          } else {
              return false;
          }
      },
      handleChangeCategory(e) {
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
      handleOkButton() {
          let data = {
              blastId: this.blastId,
              activity: this.activity,
              category: this.category
          }
          this.$emit('select-ok-button', data);
          this._clearData();
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
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