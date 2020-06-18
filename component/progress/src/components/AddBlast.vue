<template>
    <div v-if="isType()" id="blastAddEditor" class="blast-add-container">
      <div class="blast-add-title-container">
        ADD BLAST
      </div>
      <div class="blast-add-body-container">
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Tunnel ID</div>
          <input type="text" class="blast-add-body-content-message"
              :value="getTunnelName" disabled>
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Explosive</div>
          <input type="number" class="blast-add-body-content-message"
              @change="handleChangeBlastExplosive">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Detonator</div>
          <input type="number" class="blast-add-body-content-message"
              @change="handleChangeBlastDetonator">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Drilling Depth</div>
          <input type="number" class="blast-add-body-content-message"
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
          <input type="number" class="blast-add-body-content-message"
              @change="handleChangeBlastStartPoint">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Finish Point</div>
          <input type="number" class="blast-add-body-content-message"
              @change="handleChangeBlastFinishPoint">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Blast Length</div>
          <input type="number" class="blast-add-body-content-message"
              @change="handleChangeBlastBlastingLength">
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
        }
    },
    data() {
        return {
            tunnelInfo: null,
            explosive: 0,
            detonator: 0,
            drillingDepth: 0,
            blastingDate: null,
            blastingTime: null,
            startPoint: 0,
            finishPoint: 0,
            blastingLength: 0
        }
    },
    methods: {
      isType() {
          this.tunnelInfo = this.$store.getters.getTunnel(this.tunnelId);
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
      handleChangeBlastStartPoint(e) {
          this.startPoint = e.target.value;
      },
      handleChangeBlastFinishPoint(e) {
          this.finishPoint = e.target.value;
      },
      handleChangeBlastBlastingLength(e) {
          this.blastingLength = e.target.value;
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
.blast-add-container {
    position: absolute;
    width: 400px;
    height: 100%;
    right: 0;
    z-index: 1;
    background-color: red;
    cursor: default;
    border-radius: 10px 0 0 10px!important;
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
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
}
.blast-add-cancle-button {
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