<template>
    <div v-if="isType()" id="blastAddEditor" class="blast-add-container">
      <div class="blast-add-title-container">
        ADD EXCAVATION
      </div>
      <div class="blast-add-body-container">
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Tunnel ID</div>
          <input type="text" class="blast-add-body-content-message default-cursor"
              :value="getTunnelName" readonly>
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Explosive Bulk</div>
          <input type="number" class="blast-add-body-content-message"
              :value="getExplosiveBulk"
              @change="handleChangeBlastExplosiveBulk">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Explosive Cartridge</div>
          <input type="number" class="blast-add-body-content-message"
              :value="getExplosiveCartridge"
              @change="handleChangeBlastExplosiveCartridge">
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
              step="0.1" :value="getDrillingDepth"
              @change="handleChangeBlastDrillingDepth">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Blast Date</div>
          <input type="date" class="blast-add-body-content-message"
              :value="getBlastDate"
              @change="handleChangeBlastBlastingDate">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Blast Time</div>
          <input type="time" class="blast-add-body-content-message"
              step="1800" min="00:00" max="23:59"
              :value="getBlastTime"
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
              step="0.1" :value="getFinishPoint" :min="getMinFinishPoint"
              :max="getMaxFinishPoint"
              @change="handleChangeBlastFinishPoint">
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Blast Length</div>
          <input type="number" class="blast-add-body-content-message default-cursor"
              :value="getBlastingLength" readonly>
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Charging Team</div>
          <select class="blast-add-body-content-message default-cursor"
              @change="handleChangeChargingTeam">
              <option disabled selected>Select Team</option>
              <option v-for="value in getTeamList" :value="value.id" :key="value.id">
                  {{ value.name }}
              </option>
          </select>
        </div>
        <div class="blast-add-body-content-container">
          <div class="blast-add-body-content-title">Charging Team Nos</div>
          <input type="number" class="blast-add-body-content-message default-cursor"
              :value="getTeamNos"
              @change="handleChangeChargingTeamNos" readonly>
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
        },
        finishedBlastData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            tunnelInfo: null,
            lastBlast: null,
            dateCheck: false,
            timeCheck: false,
            finishPointCheck: false,
            explosiveBulk: 0,
            explosiveCartridge: 0,
            detonator: 0,
            drillingDepth: 0.0,
            blastingDate: null,
            blastingTime: null,
            changedBlastingTime: null,
            changedBastingDate: null,
            startPoint: 0.0,
            finishPoint: 0.0,
            blastingLength: 0.0,
            isChangeFinishPoint: false,
            teamId: null,
            teamNos: 0
        }
    },
    methods: {
      _clearData() {
          this.tunnelInfo = null;
          this.lastBlast = null;
          this.timeCheck = false;
          this.dateCheck = false;
          this.finishPointCheck = false;
          this.explosiveBulk = 0;
          this.explosiveCartridge = 0;
          this.detonator = 0;
          this.drillingDepth = 0.0;
          this.blastingDate = null;
          this.blastingTime = null;
          this.changedBlastingTime =  null;
          this.changedBastingDate =  null;
          this.startPoint = 0.0;
          this.finishPoint = 0.0;
          this.blastingLength = 0.0;
          this.isChangeFinishPoint = false;
          this.teamId = null;
          this.teamNos = 0;
      },
      isType() {
          this.tunnelInfo = this.$store.getters.getTunnel(this.tunnelId);
          if (this.lastBlastId != '') {
              this.lastBlast = this.$store.getters.getBlast(this.lastBlastId);
          }
          return this.type == window.CONSTANTS.TYPE.ADD_BLAST;
      },
      handleChangeBlastExplosiveBulk(e) {
          this.explosiveBulk = e.target.value;
          if (!!!this.explosiveBulk) {
            this.explosiveBulk = 0
          }
      },
      handleChangeBlastExplosiveCartridge(e) {
          this.explosiveCartridge = e.target.value;
          if (!!!this.explosiveCartridge) {
            this.explosiveCartridge = 0
          }
      },
      handleChangeBlastDetonator(e) {
          this.detonator = e.target.value;
          if (!!!this.detonator) {
            this.detonator = 0
          }
      },
      handleChangeBlastDrillingDepth(e) {
          this.drillingDepth = e.target.value;
          if (!!!this.drillingDepth) {
            this.drillingDepth = 0.0
          }
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
      handleChangeChargingTeam(e) {
          this.teamId = e.target.value;
      },
      handleChangeChargingTeamNos(e) {
          this.teamNos = e.target.value;
      },
      _timeCheck() {
          if (!!this.blastingTime) {
              this.timeCheck = true;
          } else {
              this.sweetbox.fire("Time is required. Please enter a Time.");
              this.timeCheck = false;
          }
      },
      _dateCheck() {
          if (!!this.blastingDate) {
              this.dateCheck = true;
          } else {
              this.dateCheck = false;
              this.sweetbox.fire("Date is required. Please enter Date.");
          }
      },
      _finishPointCheck(){
          if (this.blastingLength >= 0) {
              this.finishPointCheck = true;
          } else {
              this.sweetbox.fire("The length you are trying to change cannot be minus length.. Please check the Finish point and Blasing Length.");
              this.finishPointCheck = false;
          }
      },
      handleOkButton() {
          this._dateCheck();
          this._timeCheck();
          this._finishPointCheck();
          if (!!this.timeCheck && !!this.dateCheck && !!this.finishPointCheck) {
              let data = {
                  explosive_bulk: this.explosiveBulk,
                  explosive_cartridge: this.explosiveCartridge,
                  detonator: this.detonator,
                  drilling_depth: this.drillingDepth,
                  blasting_date: this.blastingDate,
                  blasting_time: this.blastingTime,
                  start_point: this.startPoint,
                  finish_point: this.finishPoint,
                  blasting_length: this.blastingLength,
                  team_id: this.teamId,
                  team_nos: this.teamNos
              }
              this.$emit('select-ok-button', this.tunnelId, data);
              this._clearData();
          }
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
          this._clearData();
      },
    },
    computed: {
        getTunnelName() {
            return `${ this.tunnelInfo.tunnel_id }`;
        },
        getExplosiveBulk() {
            return this.explosiveBulk;
        },
        getExplosiveCartridge() {
            return this.explosiveCartridge;
        },
        getDetonator() {
            return this.detonator;
        },
        getDrillingDepth() {
            return this.drillingDepth;
        },
        getBlastDate(){
            let startDate = '',
                lastWork = ''
            if (!!!this.blastingDate) {
                if (!!!this.finishedBlastData) {
                    if (this.lastBlast) {
                        if (this.lastBlast.work_list.length != 0) {
                            lastWork = this.lastBlast.work_list[0].work_history_list[0];
                        }
                    }
                    if (!!lastWork) {
                        if (lastWork.typ == 114 && lastWork.state == 2) {
                            startDate = lastWork.timestamp;
                        }
                        this.blastingDate = startDate.substring(0, 10);
                    }
                } else {
                    lastWork = this.finishedBlastData.work_list[0].work_history_list[0];
                    if (lastWork.typ == 114 && lastWork.state == 2) {
                        startDate = lastWork.timestamp;
                        this.blastingDate = startDate.substring(0, 10);
                    }
                }
                return startDate.substring(0, 10);
            } else {
                return this.blastingDate;
            }
        },
        getBlastTime(){
            let startTime = '',
                lastWork = '';
            if (!!!this.blastingTime) {
                if (!!!this.finishedBlastData) {
                    if (this.lastBlast) {
                        if (this.lastBlast.work_list.length != 0) {
                            lastWork = this.lastBlast.work_list[0].work_history_list[0];
                        }
                    }
                    if (!!lastWork) {
                        if(lastWork.typ == 114 && lastWork.state == 2) {
                            startTime = lastWork.timestamp;
                        }
                        this.blastingTime = startTime.substring(11, 19);
                    }
                } else {
                    lastWork = this.finishedBlastData.work_list[0].work_history_list[0];
                    if (lastWork.typ == 114 && lastWork.state == 2) {
                        startTime = lastWork.timestamp;
                        this.blastingTime = startTime.substring(11, 19);
                    }
                }
                return startTime.substring(11, 19);
            } else {
                return this.blastingTime;
            }
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
                    this.finishPoint = this.lastBlast.blast_info.finish_point + 5;
                } else {
                    this.finishPoint = 5;
                }
            }
            return this.finishPoint;
        },
        getMaxFinishPoint() {
            let ret = this.tunnelInfo.length - this.tunnelInfo.b_accum_length;
            return ret;
        },
        getMinFinishPoint() {
            let ret = this.startPoint + 10;
            return ret;
        },
        getBlastingLength() {
            this.blastingLength = this.finishPoint - this.startPoint;
            this.blastingLength = parseFloat(this.blastingLength.toFixed(1));
            return this.blastingLength;
        },
        getTeamList() {
            return this.$store.getters.getTeamList();
        },
        getTeamNos() {
            return this.teamNos;
        },
    },
    created() {
        //this._clearData();
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
    overflow-y: scroll;
}
.blast-add-body-content-container {
    font-size: 1.4em;
}
.blast-add-body-content-title {
    width: 35%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.blast-add-body-content-message {
    width: 65%;
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