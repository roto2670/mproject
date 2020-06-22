<template>
    <div v-if="isType()" id="blastAddEditor" class="blast-add-container">
      <div class="blast-add-title-container">
        ADD BLAST
      </div>
      <div class="blast-add-body-container">
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Tunnel ID</div>
          <input type="text" class="blast-add-body-content-message default-cursor"
              :value="getTunnelName" readonly>
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Explosive</div>
          <input type="number" class="blast-add-body-content-message"
              :value="getExplosive"
              @change="handleChangeBlastExplosive">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Detonator</div>
          <input type="number" class="blast-add-body-content-message"
              :value="getDetonator"
              @change="handleChangeBlastDetonator">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Drilling Depth</div>
          <input type="number" class="blast-add-body-content-message"
              :value="getDrillingDepth"
              @change="handleChangeBlastDrillingDepth">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Blast Date</div>
          <input type="date" class="blast-add-body-content-message"
              @change="handleChangeBlastBlastingDate">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Blast Time</div>
          <input type="time" class="blast-add-body-content-message"
              @change="handleChangeBlastBlastingTime">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Start Point</div>
          <input type="number" class="blast-add-body-content-message default-cursor"
              :value="getStartPoint" readonly>
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Finish Point</div>
          <input type="number" class="blast-add-body-content-message"
              :value="getFinishPoint" :min="getMinFinishPoint"
              :max="getMaxFinishPoint"
              @change="handleChangeBlastFinishPoint">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Blast Length</div>
          <input type="number" class="blast-add-body-content-message default-cursor"
              :value="getBlastingLength" readonly>
        </div>
      </div>
      <div class="blast-add-button-container">
        <div class="blast-add-ok-button"
            @click="handleOkButton">
          OK
        </div>
        <div class="blast-add-cancle-button"
            @click="handleCancelButton">
          CANCEL
        </div>
      </div>
    </div>
</template>
<script>
export default {
    name: 'AddBlast',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
        tunnelId: {
            type: String
        },
        lastBlastId: {
            type: String
        }
    },
    data() {
        return {
            tunnelInfo: null,
            lastBlast: null,
            explosive: 0,
            detonator: 0,
            drillingDepth: 0,
            blastingDate: null,
            blastingTime: null,
            startPoint: 0,
            finishPoint: 0,
            blastingLength: 0,
            isChangeFinishPoint: false
        }
    },
    methods: {
      isType() {
          this.tunnelInfo = this.$store.getters.getTunnel(this.tunnelId);
          if (this.lastBlastId != '') {
              this.lastBlast = this.$store.getters.getBlast(this.lastBlastId);
          }
          return this.type == window.CONSTANTS.TYPE.ADD_BLAST;
      },
      handleChangeBlastExplosive(e) {
          this.explosive = e.target.value;
      },
      handleChangeBlastDetonator(e) {
          this.detonator = e.target.value;
      },
      handleChangeBlastDrillingDepth(e) {
          this.drillingDepth = e.target.value;
      },
      handleChangeBlastBlastingDate(e) {
          this.blastingDate = e.target.value;
      },
      handleChangeBlastBlastingTime(e) {
          this.blastingTime = e.target.value;
      },
      handleChangeBlastFinishPoint(e) {
          this.isChangeFinishPoint = true;
          this.finishPoint = e.target.value;
          let maxLength = this.tunnelInfo.length - this.tunnelInfo.b_accum_length;
          if (this.finishPoint > maxLength) {
              this.finishPoint = maxLength;
          }
          this.blastingLength = this.finishPoint - this.startPoint;
          this.$emit('change-blasting-length', this.tunnelId, this.lastBlastId, this.blastingLength);
      },
      handleOkButton() {
          let data = {
              explosive: this.explosive,
              detonator: this.detonator,
              drilling_depth: this.drillingDepth,
              blasting_date: this.blastingDate,
              blasting_time: this.blastingTime,
              start_point: this.startPoint,
              finish_point: this.finishPoint,
              blasting_length: this.blastingLength
          }
          this.$emit('select-ok-button', this.tunnelId, data);
          this.clearData();
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
          this.clearData();
      },
      clearData() {
          this.tunnelInfo = null;
          this.lastBlast = null
          this.explosive = 0;
          this.detonator = 0;
          this.drillingDepth = 0;
          this.blastingDate = null;
          this.blastingTime = null;
          this.startPoint = 0;
          this.finishPoint = 0;
          this.blastingLength = 0;
          this.isChangeFinishPoint = false;
      }
    },
    computed: {
        getTunnelName() {
            return `${ this.tunnelInfo.tunnel_id }`;
        },
        getExplosive() {
            return this.explosive;
        },
        getDetonator() {
            return this.detonator;
        },
        getDrillingDepth() {
            return this.drillingDepth;
        },
        getStartPoint() {
            if (this.lastBlast != null) {
                this.startPoint = this.lastBlast.blast_info.finish_point;
            } else {
                this.startPoint = 0;
            }
            return this.startPoint;
        },
        getFinishPoint() {
            if (!this.isChangeFinishPoint) {
                if (this.lastBlast != null) {
                    this.finishPoint = this.lastBlast.blast_info.finish_point + 1;
                } else {
                    this.finishPoint = 1;
                }
            }
            return this.finishPoint;
        },
        getMaxFinishPoint() {
            return this.tunnelInfo.length - this.tunnelInfo.b_accum_length;
        },
        getMinFinishPoint() {
            return this.startPoint + 1;
        },
        getBlastingLength() {
            this.blastingLength = this.finishPoint - this.startPoint;
            return this.blastingLength;
        }
    },
    created() {
    }
}
</script>
<style>
.blast-add-container {
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
.blast-add-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
}
.blast-add-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.blast-add-body-content-container {
    font-size: 1.4em;
}
.blast-add-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.blast-add-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 15px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
    color: #1b94e2;;
}

.blast-add-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.blast-add-ok-button {
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
.blast-add-cancle-button {
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
.default-cursor {
    cursor: default;
}
</style>