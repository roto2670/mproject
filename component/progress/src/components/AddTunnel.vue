<template>
    <div v-if="isType()" id="tunnelAddEditor" class="tunnel-add-container">
      <div class="tunnel-add-title-container">
        ADD TUNNEL
      </div>
      <div class="tunnel-add-body-container">
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">ID</div>
          <input id="tunnelId" type="text" class="tunnel-add-body-content-message"
              maxlength="30" @change="handleChangeId">
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Length</div>
          <input id="tunnelLength" type="number" class="tunnel-add-body-content-message"
              value=0 maxlength="30" @change="handleChangeLength">
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Direction</div>
          <select class="tunnel-add-body-content-message" @change="handleChangeDirection">
              <option v-for="(key, value) in baseDirections"
                  :value="value" :key="key">{{ value }}</option>
          </select>
        </div>
      </div>
      <div class="tunnel-add-button-container">
        <div class="tunnel-add-ok-button"
            @click="handleOkButton">
          OK
        </div>
        <div class="tunnel-add-cancle-button"
            @click="handleCancelButton">
          CANCEL
        </div>
      </div>
    </div>
</template>
<script>
export default {
    name: 'AddTunnel',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
    },
    data() {
        return {
            baseDirections : window.CONSTANTS.PROG_DIR,
            tunnelId: null,
            tunnelLength: 0,
            tunnelDirection: 0
        }
    },
    methods: {
      isType() {
          return this.type == window.CONSTANTS.TYPE.ADD_TUNNEL;
      },
      handleOkButton() {
          let data = {
              tunnelId: this.tunnelId,
              tunnelLength: this.tunnelLength,
              tunnelDirection: this.tunnelDirection
          }
          if (tunnelId !== null) {
             this.$emit('select-ok-button', data);
          } else {
              // TODO:
              console.log("#### tunnel id is null")
          }
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
      },
      handleChangeId(e) {
          this.tunnelId = e.target.value;
      },
      handleChangeLength(e) {
          this.tunnelLength = e.target.value;
      },
      handleChangeDirection(e) {
          this.tunnelDirection = e.target.selectedIndex;
          this.$emit('change-tunnel-direction', this.tunnelDirection);
      }
    },
    computed: {
    },
    created() {
    }
}
</script>
<style>
.tunnel-add-container {
    position: absolute;
    width: 400px;
    height: 100%;
    right: 0;
    z-index: 1;
    background-color: #a3c9e0;
    cursor: default;
}
.tunnel-add-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
}
.tunnel-add-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.tunnel-add-body-content-container {
    font-size: 1.4em;
}
.tunnel-add-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 18px;
    display: inline-block;
}
.tunnel-add-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 18px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
}
.tunnel-add-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.tunnel-add-ok-button {
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
.tunnel-add-cancle-button {
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