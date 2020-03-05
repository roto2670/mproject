<template>
    <div v-if="isType()" id="progressAddEditor" class="progress-add-container">
      <div class="progress-add-title-container">
        ADD PROGRESS
      </div>
      <div class="progress-add-body-container">
        <div class="progress-add-body-content-container">
          <div class="progress-add-body-content-title">Tunnel ID</div>
          <input type="text" class="progress-add-body-content-message"
              :value="getTunnelName" disabled>
        </div>
        <div class="progress-add-body-content-container">
          <div class="progress-add-body-content-title">Name</div>
          <input id="progressId" type="text" class="progress-add-body-content-message"
              @change="handleChangeProgressName">
        </div>
        <div class="progress-add-body-content-container">
          <div class="progress-add-body-content-title">Chainage</div>
          <input type="text" class="progress-add-body-content-message">
        </div>
      </div>
      <div class="progress-add-button-container">
        <div class="progress-add-ok-button"
            @click="handleOkButton">
          OK
        </div>
        <div class="progress-add-cancle-button"
            @click="handleCancelButton">
          CANCEL
        </div>
      </div>
    </div>
</template>
<script>
export default {
    name: 'AddProgress',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
        tunnelId: {
            type: String
        }
    },
    data() {
        return {
            tunnelInfo: null,
            chainage: '',
            progressName: ''
        }
    },
    methods: {
      isType() {
          this.tunnelInfo = this.$store.getters.getTunnel(this.tunnelId);
          return this.type == window.CONSTANTS.TYPE.ADD_PROGRESS;
      },
      handleChangeChainage(e) {
          this.chainage = e.target.value;
      },
      handleChangeProgressName(e) {
          this.progressName = e.target.value;
      },
      handleOkButton() {
          let data = {
              tunnelId: this.tunnelId,
              chainage: this.chainage,
              progressName: this.progressName
          }
          this.$emit('select-ok-button', data);
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
      }
    },
    computed: {
        getTunnelName() {
            return `${ this.tunnelInfo.name }`;
        },
    },
    created() {
    }
}
</script>
<style>
.progress-add-container {
    position: absolute;
    width: 400px;
    height: 100%;
    right: 0;
    z-index: 1;
    background-color: red;
    cursor: default;
}
.progress-add-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
}
.progress-add-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.progress-add-body-content-container {
    font-size: 1.4em;
}
.progress-add-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 18px;
    display: inline-block;
}
.progress-add-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 18px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
}

.progress-add-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.progress-add-ok-button {
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
.progress-add-cancle-button {
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