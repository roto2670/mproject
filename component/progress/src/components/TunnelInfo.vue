<template>
    <div v-if="isType()">
      <div v-if="isEdit" id="tunnelInfoEditor" class="tunnel-info-container">
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
      <div v-else id="tunnelInfoEditor" class="tunnel-info-container">
        <div class='panel-close-button' @click="handleCloseButton"></div>
        <div class="tunnel-info-title-container" :title="getItemName">
            {{ tunnelInfo.tunnel_id }}
        </div>
        <div class="tunnel-info-body-container">
          <div class="tunnel-info-body-content-container">
            <div class="tunnel-info-body-content-title">Name</div>
            <input type="text" class="tunnel-info-body-content-message" :value="getItemName"
                readonly>
          </div>
          <div class="tunnel-info-body-content-container">
            <div class="tunnel-info-body-content-title">Length</div>
            <input type="text" class="tunnel-info-body-content-message" :value="getLength"
                readonly>
          </div>
          <div class="tunnel-info-body-content-container">
            <div class="tunnel-info-body-content-title">Started Date</div>
            <input v-if="isStarted()" type="datetime-local" class="work-info-body-content-message"
                :value="getStartTime" readonly>
            <input v-else type="text" class="tunnel-info-body-content-message" value="Not Started"
                readonly>
          </div>
          <div class="tunnel-info-body-content-container">
            <div class="tunnel-info-body-content-title">Time Elapse</div>
            <input type="text" class="tunnel-info-body-content-message" :value="getTotalTime"
                readonly>
          </div>
          <div class="tunnel-info-body-button-container">
            <div class="tunnel-info-body-button-edit"
                @click="handleEditTunnelButton">EDIT</div>
            <div class="tunnel-info-body-button-remove"
                @click="handleRemoveTunnelButton">REMOVE</div>
          </div>
          <div class="tunnel-info-body-blast-container">
            <!--
            <div class="tunnel-info-body-blast-list-container">
            </div>
                -->
            <div class="tunnel-info-body-blast-button-container">
              <div class="tunnel-info-body-blast-button-add"
                  @click="handleAddBlastButton">Start Work</div>
            </div>
          </div>
        </div>
        <div class="tunnel-info-button-container">
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
          if (this.type == window.CONSTANTS.TYPE.SELECT_CAVERN) {
             this.tunnelInfo = this.$store.getters.getTunnel(this.id);
             return true;
          } else {
              return false;
          }
      },
      isStarted() {
          // TODO:
          let a = this.tunnelInfo.initial_b_time != null;
          return a;
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
          this.isEdit = false;
      },
      handleCloseButton() {
          this.$emit('select-close-button', {});
      },
      handleEditTunnelButton() {
          // TODO:
          // this.isEdit = true;
      },
      handleRemoveTunnelButton() {
          // TODO:
          // this.$emit('select-remove-tunnel-button', this.id);
      },
      handleAddBlastButton() {
          this.$emit('select-add-blast-button', this.id, window.CONSTANTS.TUNNEL_TYPE.CAVERN);
      },
    },
    computed: {
        getItemName() {
            return `${ this.tunnelInfo.tunnel_id }`;
        },
        getLength() {
            let curLength = this.tunnelInfo.b_accum_length,
                totalLength = this.tunnelInfo.length,
                percent = (curLength / totalLength) * 100;
            return curLength + "m / " + totalLength + "m ( " + percent + " % )";
        },
        getStartTime() {
            return this.tunnelInfo.initial_b_time;
        },
        getTotalTime() {
            let totalTime = 0,
                tmpTime = new Date(0);
            this._.forEach(this.tunnelInfo.blast_list, blast => {
                totalTime += blast.accum_time;
            });
            tmpTime.setSeconds(totalTime);
            return tmpTime.toISOString().substr(11,8);
            return totalTime;
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
    background-color: #39B2FF;
    color: #ffffff;
    cursor: default;
    border-radius: 10px 0 0 10px!important;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
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
    font-size: 15px;
    display: inline-block;
}
.tunnel-info-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 15px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    color: #1b94e2;
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
    cursor: default;
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
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
.tunnel-info-body-button-remove {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
.tunnel-info-body-blast-container {
    text-align: center;
}
.tunnel-info-body-blast-list-container {
    border: 1px solid;
    width: 100%;
    height: 5em;
}
.tunnel-info-body-blast-button-container {
}
.tunnel-info-body-blast-button-add {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 13em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
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
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
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
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
.tunnel-info-close-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
.panel-close-button {
    position: absolute;
    background-size: 20px !important;
    background-color: rgba(255 117 117) !important;
    background-image: url(../../public/static/imgs/close.png);
    border-radius: 10px 0 0 10px!important;
    height: 40px;
    width: 40px;
    background-repeat: no-repeat;
    background-position: center center;
    left: -40px;
    top: 10px;
    cursor: pointer;
}
</style>