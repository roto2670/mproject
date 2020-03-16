<template>
    <div v-if="isType()" id="workAddEditor" class="work-add-container">
      <div class="work-add-title-container">
        ADD Work
      </div>
      <div class="work-add-body-container">
        <div class="work-add-body-content-container">
          <div class="work-add-body-content-title">Name</div>
          <input id="workId" type="text" class="work-add-body-content-message"
              @change="handleChangeWorkName">
        </div>
        <div class="work-add-body-content-container">
          <div class="work-add-body-content-title">Chainage</div>
          <input type="text" class="work-add-body-content-message">
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
        progressId: {
            type: String
        }
    },
    data() {
        return {
            progressInfo: null,
            chainage: '',
            workName: ''
        }
    },
    methods: {
      isType() {
          this.progressInfo = this.$store.getters.getProgress(this.progressId);
          return this.type == window.CONSTANTS.TYPE.ADD_WORK;
      },
      handleChangeChainage(e) {
          this.chainage = e.target.value;
      },
      handleChangeWorkName(e) {
          this.workName = e.target.value;
      },
      handleOkButton() {
          let data = {
              progressId: this.progressId,
              chainage: this.chainage,
              workName: this.workName
          }
          this.$emit('select-ok-button', data);
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
      }
    },
    computed: {
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
    background-color: red;
    cursor: default;
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
    font-size: 18px;
    display: inline-block;
}
.work-add-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 18px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
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
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
}
.work-add-cancle-button {
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
</style>