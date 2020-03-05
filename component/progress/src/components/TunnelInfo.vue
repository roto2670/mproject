<template>
    <div v-if="isType()">
      <div v-if="isEdit" id="tunnelInfoEditor" class="tunnel-info-container">
      </div>
      <div v-else id="tunnelInfoEditor" class="tunnel-info-container">
        <div class="tunnel-info-title-container" :title="getItemName">
            {{ tunnelInfo.name }}
        </div>
        <div class="tunnel-info-body-container">
          <div class="tunnel-info-body-content-container">
            <div class="tunnel-info-body-content-title">Type</div>
            <input type="text" class="tunnel-info-body-content-message" :value="getItemType"
                disabled>
          </div>
          <div class="tunnel-info-body-button-container">
            <div class="tunnel-info-body-button-edit"
                @click="handleEditTunnelButton">EDIT</div>
            <div class="tunnel-info-body-button-remove"
                @click="handleRemoveTunnelButton">REMOVE</div>
          </div>
          <div class="tunnel-info-body-progress-container">
            <div class="tunnel-info-body-progress-list-container">
            </div>
            <div class="tunnel-info-body-progress-button-container">
              <div class="tunnel-info-body-progress-button-add"
                  @click="handleAddProgressButton">ADD PROGRESS</div>
            </div>
          </div>
        </div>
        <div class="tunnel-info-button-container">
          <div class="tunnel-info-ok-button"
              @click="handleOkButton">
            OK
          </div>
          <div class="tunnel-info-cancle-button"
              @click="handleCancelButton">
            CANCEL
          </div>
        </div>
      </div>
    </div>
</template>
<script>
export default {
    name: 'TunnelInfo',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
        id: {
          type: String
        }
    },
    data() {
        return {
            isEdit: false,
            name: 'hi',
            length: '',
            direction: '',
            tunnelInfo: null,
        }
    },
    methods: {
      isType() {
          this.tunnelInfo = this.$store.getters.getTunnel(this.id);
          return this.type == window.CONSTANTS.TYPE.SELECT_CAVERN ||
              this.type == window.CONSTANTS.TYPE.SELECT_WATER_CURTAIN;
      },
      handleOkButton() {
          const data = {};
          data._id = this.id;
          data.name = this.name;
          data.width = this.length;
          data.prog_dir = this.direction;
          this.$emit('select-ok-button', data);
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
      },
      handleEditTunnelButton() {
      },
      handleRemoveTunnelButton() {
          this.$emit('select-remove-tunnel-button', this.id);
      },
      handleAddProgressButton() {
          console.log("### add progress. id, type", this.id, this.tunnelInfo.typ);
          this.$emit('select-add-progress-button', this.id, this.tunnelInfo.typ);
      },
    },
    computed: {
        getItemName() {
            return `${ this.tunnelInfo.name }`;
        },
        getItemType() {
            if (this.tunnelInfo.typ === window.CONSTANTS.TUNNEL_TYPE.CAVERN) {
                return "CAVERN";
            } else {
                return "WATER CURTAIN";
            }
        }
    },
    created() {
    }
}
</script>
<style>
.tunnel-info-container {
    position: absolute;
    width: 400px;
    height: 100%;
    right: 0;
    z-index: 1;
    background-color: #a3c9e0;
    cursor: default;
}
.tunnel-info-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.tunnel-info-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.tunnel-info-body-content-container {
    font-size: 1.4em;
}
.tunnel-info-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 18px;
    display: inline-block;
}
.tunnel-info-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 18px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
    display: inline-block
}
.tunnel-info-body-button-container {
    text-align: center;
}
.tunnel-info-body-button-edit {
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
.tunnel-info-body-button-remove {
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
.tunnel-info-body-progress-container {
    text-align: center;
}
.tunnel-info-body-progress-list-container {
    border: 1px solid;
    width: 100%;
    height: 5em;
}
.tunnel-info-body-progress-button-container {
}
.tunnel-info-body-progress-button-add {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 12em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
}
.tunnel-info-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.tunnel-info-ok-button {
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
.tunnel-info-cancle-button {
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