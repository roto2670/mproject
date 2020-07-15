<template>
    <div v-if="isType()">
        <div id="blastInfoEditor" class="blast-information-container">
            <div class='panel-close-button' @click="handleCloseButton"></div>
            <div class="blast-information-title-container">
                Blast Information
            </div>
            <div class="blast-information-body-container">
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Explosive</div>
                    <input class="blast-information-body-content-message" type="number"
                        :value="getExplosive" readonly>
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Detonator</div>
                    <input class="blast-information-body-content-message" type="number"
                        :value="getDetonator" readonly>
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Drilling Depth</div>
                    <input class="blast-information-body-content-message" type="number"
                        :value="getDrillingDepth" readonly>
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Blasting Date</div>
                    <input class="blast-information-body-content-message" type="date"
                        :value="getBlastingDate" readonly>
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Blasting Time</div>
                    <input class="blast-information-body-content-message" type="time"
                        :value="getBlastingTime" readonly>
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Start Point</div>
                    <input class="blast-information-body-content-message" type="number"
                        :value="getStartPoint" readonly>
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Finish Point</div>
                    <input class="blast-information-body-content-message" type="number"
                        :value="getFinishPoint" readonly>
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Length</div>
                    <input class="blast-information-body-content-message" type="number"
                        :value="getLength" readonly>
                </div>

                <div class="work-info-body-list-container">
                    <div class="work-info-body-list-title-container">
                        Operator List
                    </div>
                    <div class="work-info-body-sub-list-container">
                        <div class="work-info-content-list-container">
                            <div id="mainWorkList">
                                <!--
                                <WorkListItem v-for="workId in workIdList" :key="workId" :id="workId"
                                    @select-item="handleSelectWorkItem">
                                </WorkListItem>
                                -->
                            </div>
                        </div>
                    </div>
                <div class="work-info-body-list-container">
                    <div class="work-info-body-list-title-container">
                        Equipment List
                    </div>
                    <div class="work-info-body-sub-list-container">
                        <div class="work-info-content-list-container">
                            <div id="mainWorkList">
                                <!--
                                <WorkListItem v-for="pause in pauseList" :key="workId" :id="workId"
                                    @select-item="handleSelectWorkItem">
                                </WorkListItem>
                                -->
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import WorkListItem from '@/components/WorkListItem';
export default {
    name: 'BlastInformation',
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
            blastInfo: null,
            blastInformation: null,
            blastDate: "",
            blastTime: "",
            blastingLength: 0,
        }
    },
    methods: {
      isType() {
          if (this.type == window.CONSTANTS.TYPE.SELECT_BLAST_INFORMATION) {
              this.blast = this.$store.getters.getBlast(this.id);
              this.blastInformation = this.blast.blast_info;
              this.blastingLength = this.blastInformation.blasting_length;
              return true;
          } else {
              return false;
          }
      },
      handleCloseButton() {
          this.$emit('select-close-button', {});
      },
      handleSelectWorkItem(workId) {
          this.$emit("select-work-item", workId);
      }
    },
    computed: {
        getExplosive() {
            return this.blastInformation.explosive;
        },
        getDetonator() {
            return this.blastInformation.detonator;
        },
        getDrillingDepth() {
            return this.blastInformation.drilling_depth.toFixed(1);
        },
        getBlastingDate() {
            let date = null;
            if (this.blastInformation.blasting_time != null) {
                date = this.blastInformation.blasting_time.split(' ')[0];
            }
            return date;
        },
        getBlastingTime() {
            let time = null;
            if (this.blastInformation.blasting_time != null) {
                time = this.blastInformation.blasting_time.split(' ')[1];
            }
            return time;
        },
        getStartPoint() {
            return this.blastInformation.start_point.toFixed(1);
        },
        getFinishPoint() {
            return this.blastInformation.finish_point.toFixed(1);
        },
        getLength() {
            return this.blastingLength.toFixed(1);
        },
    },
    created() {
    }
}
</script>
<style>
.blast-information-container {
    position: absolute;
    width: 400px;
    height: 100%;
    right: 0;
    z-index: 1;
    background-color: #39b2ff;
    color: #fff;
    cursor: default;
    border-radius: 10px 0 0 10px!important;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
}
.blast-information-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.blast-information-body-container {
    width: 100%;
    height: 85%;
    padding: 1em;
    overflow-y: scroll;
}
.blast-information-body-container.edit {
    height: 75%;
}
.blast-information-body-content-container {
    font-size: 1.4em;
}
.blast-information-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.blast-information-body-content-message {
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
.blast-information-body-button-container {
    text-align: center;
}
.blast-information-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.panel-close-button {
    position: absolute;
    background-size: 20px !important;
    background-color: rgba(255 117 117) !important;
    background-image: url(../../public/static/location/imgs/close.svg);
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
