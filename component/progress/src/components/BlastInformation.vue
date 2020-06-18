<template>
    <div v-if="isType()">
        <div v-if="isEdit" id="blastInformationEditor" class="blast-information-container">
            <div class="blast-information-title-container">
                Blast Information
            </div>
            <div class="blast-information-body-container" :class="{ edit: isEdit }">
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Explosive</div>
                    <input class="blast-information-body-content-message" :value="getExplosive"
                        type="number" maxlength="30" @change="handleChangeExplosive" >
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Detonator</div>
                    <input class="blast-information-body-content-message" :value="getDetonator"
                        type="number" maxlength="30" @change="handleChangeDetonator" >
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Drilling Depth</div>
                    <input class="blast-information-body-content-message" :value="getDrillingDepth"
                        type="number" maxlength="30" @change="handleChangeDrillingDepth" >
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Blasting Date</div>
                    <input class="blast-information-body-content-message" :value="getBlastingDate"
                        type="date" maxlength="30" @change="handleChangeBlastingDate" >
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Blasting Time</div>
                    <input class="blast-information-body-content-message" :value="getBlastingTime"
                        type="time" maxlength="30" @change="handleChangeBlastingTime" >
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Start Point</div>
                    <input class="blast-information-body-content-message" :value="getStartPoint"
                        type="number" maxlength="30" @change="handleChangeStartPoint" >
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Finish Point</div>
                    <input class="blast-information-body-content-message" :value="getFinishPoint"
                        type="number" maxlength="30" @change="handleChangeFinishPoint" >
                </div>
                <div class="blast-information-body-content-container">
                    <div class="blast-information-body-content-title">Length</div>
                    <input class="blast-information-body-content-message" :value="getLength"
                        type="number" maxlength="30" @change="handleChangeLength" readonly>
                </div>
            </div>
            <div class="blast-information-button-container">
                <div class="blast-information-ok-button"
                    @click="handleOkButton">
                OK
                </div>
                <div class="blast-information-cancle-button"
                    @click="handleCancelButton">
                CANCEL
                </div>
            </div>
        </div>
        <div v-else id="blastInfoEditor" class="blast-information-container">
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

                <div class="blast-information-body-button-container">
                    <div class="blast-information-body-button-edit"
                        @click="handleEditBlastButton">EDIT</div>
                    <div class="blast-information-body-button-remove"
                        @click="handleRemoveBlastButton" disabled>REMOVE</div>
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
                    <!--
                    <div class="work-info-body-list-button-container">
                        <div class="work-info-body-list-button-add"
                            @click="handleAddWorkButton">ADD Operator</div>
                    </div>
                    -->
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
                    <!--
                    <div class="work-info-body-list-button-container">
                        <div class="work-info-body-list-button-add"
                            @click="handleAddWorkButton">ADD Equipment</div>
                    </div>
                    -->
                </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import WorkListItem from '@/components/WorkListItem';
import { EventBus } from "@/main";
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
            isEdit: false,
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
      handleOkButton() {
          this.$emit('select-ok-button', this.blastInformation);
      },
      handleCancelButton() {
          this.isEdit = false;
      },
      handleCloseButton() {
          this.$emit('select-close-button', {});
      },
      handleEditBlastButton() {
          EventBus.$emit('add-blast-status-init');
          this.isEdit = true;
      },
      handleRemoveBlastButton() {
      },
      handleAddWorkButton() {
          this.$emit('select-add-work-button', this.id);
      },
      handleChangeBlastName(e) {
          this.blastName = e.target.value;
      },
      handleChangeExplosive(e) {
          this.blastInformation.explosive = e.target.value;
      },
      handleChangeDetonator(e) {
          this.blastInformation.detonator = e.target.value;
      },
      handleChangeDrillingDepth(e) {
          this.blastInformation.drilling_depth = e.target.value;
      },
      handleChangeBlastingDate(e) {
          this.blastDate = e.target.value;
          this.blastInformation.blasting_time = this.blastDate + " " + this.blastTime;
      },
      handleChangeBlastingTime(e) {
          this.blastTime = e.target.value;
          this.blastInformation.blasting_time = this.blastDate + " " + this.blastTime;
      },
      handleChangeStartPoint(e) {
          this.blastInformation.start_point = e.target.value;
          this.blastInformation.blasting_length = this.blastInformation.finish_point - this.blastInformation.start_point;
          this.blastingLength = this.blastInformation.blasting_length;
      },
      handleChangeFinishPoint(e) {
          this.blastInformation.finish_point = e.target.value;
          this.blastInformation.blasting_length = this.blastInformation.finish_point - this.blastInformation.start_point;
          this.blastingLength = this.blastInformation.blasting_length;
      },
      handleChangeLength(e) {
        //   this.blastInformation.blasting_length = e.target.value;
        //   this.blastingLength = this.blastInformation.blasting_length;
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
            return this.blastInformation.drilling_depth;
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
            return this.blastInformation.start_point;
        },
        getFinishPoint() {
            return this.blastInformation.finish_point;
        },
        getLength() {
            return this.blastingLength;
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
    background-color: #39B2FF;
    color: #ffffff;
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
    white-space: nowrap
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
.blast-information-body-button-edit {
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
.blast-information-body-button-remove {
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
.blast-information-body-work-container {
    text-align: center;
}
.blast-information-body-work-list-container {
    border: 1px solid;
    width: 100%;
    height: 2em;
    overflow: scroll;
}
.blast-information-body-work-button-container {
}
.blast-information-body-work-button-add {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 12em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    color: #1b94e2;
    background-color: #ffffff;
}

.blast-information-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.blast-information-ok-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    color: #1b94e2;
    background-color: #ffffff;
}
.blast-information-cancle-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    color: #1b94e2;
    background-color: #ffffff;
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