<template>
    <div id="list" class="list-main-container">
        <div class="list-main-frame">
            <div class="list-control-container">
              <div class="list-top-frame1">
                <div class="left-icon-image mic-icon" :class="{ micDisabled: isDisabledMic() }"
                @click="handleMicButton"></div>
                <div class="left-icon-image play-icon"
                :class="{ playDisabled: isDisabledSound() }"
                @click="handleSoundButton"></div>
              </div>
            </div>
            <div class="list-alarm-container">
              <div class="list-top-frame">
                  <div class="list-text list-alarm-left-title">Play List</div>
                  <div class="list-text list-alarm-right-title"></div>
              </div>
              <div class="list-alarm-frame">
                <SoundItem v-for="soundId in alarmList" :key="soundId" :id="soundId"
                @select-radio-button="handleChangeSoundRadioButton"></SoundItem>
              </div>
            </div>
            <div class="list-group-container">
              <div class="list-top-frame">
                  <div class="list-text">Group</div>
                  <div class="left-group-frame-help-button" @click="handleHelpButton">
                      <div class="left-group-frame-help-image"></div>
                  </div>
              </div>
              <div class="list-group-frame">
                <GroupItem v-for="groupId in groupList" :key="groupId" :id="groupId"
                @select-checkbox="handleChangeGroupCheckbox"></GroupItem>
              </div>
            </div>
            <div class="list-reserve-container">
              <div class="list-top-frame">
                  <div class="list-text">Alarm</div>
              </div>
              <div class="list-reserve-frame">
                  <ReserveItem v-for="reserveId in reserveList" :key="reserveId" :id="reserveId"
                  @select-item="handleChangeReserveItem"
                  @select-pause="handlePause"></ReserveItem>
              </div>
            </div>
        </div>
    </div>
</template>
<script>
import GroupItem from '@/components/leftList/LeftGroupItem';
import SoundItem from '@/components/leftList/LeftSoundItem';
import ReserveItem from '@/components/leftList/LeftReserveItem';
import { EventBus } from '@/main.js';
export default {
    name: 'List',
    components: {
      GroupItem,
      SoundItem,
      ReserveItem
    },
    props: {
        groupList: {
            type: Array,
            default: []
        },
        alarmList: {
            type: Array,
            default: []
        },
        reserveList: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            title: 'Selected videos',
            selectedId: '',
            onTimeoutData: null,
            selectedAllData: false,
            enabled: true,
            dragging: false,
            checkedGroupList: [],
            selectedSoundId: '',
            disabledMic : false,
            disabledSound : true
        }
    },
    methods: {
      isDisabledMic() {
          return this.disabledMic;
      },
      isDisabledSound() {
          return this.disabledSound;
      },
      handleChangeGroupCheckbox(item, checked) {
          if (checked) {
              this.checkedGroupList.push(item);
          } else {
              this.checkedGroupList = this._.without(this.checkedGroupList, item);
          }
          this.$emit('select-group-check', item, checked);
      },
      handleChangeSoundRadioButton(itemId, isSelected) {
          if (isSelected) {
              this.selectedSoundId = itemId;
          } else {
              this.selectedSoundId = '';
          }
          // this.$emit('select-sound', item);
      },
      handleChangeReserveItem(reserveId) {
          this.$emit('select-reserve-item', reserveId);
      },
      handlePause(reserveId, isPause) {
          this.$emit('select-pause', reserveId, isPause);
      },
      handleMicButton(e) {
          if (!this.disabledMic) {
              e.stopPropagation();
              if (this.checkedGroupList.length > 0) {
                  this.$emit('select-button', this.checkedGroupList, '');
              } else {
                  // console.log("check list is empty");
              }
          }
      },
      handleSoundButton(e) {
          if (!this.disabledSound) {
              e.stopPropagation();
              if (this.checkedGroupList.length > 0 && this.selectedSoundId != '') {
                  this.$emit('select-button', this.checkedGroupList, this.selectedSoundId);
              } else {
                  // console.log("check list is empty");
              }
          }
      },
      handleHelpButton() {
          let content = `
          <div class="help-container">
              <div class="help-container-color define"></div>
              <div class="help-container-text">Zone Define</div>
          </div>
          <div class="help-container">
              <div class="help-container-color select"></div>
              <div class="help-container-text">Selected Zone</div>
          </div>
          <div class="help-container">
              <div class="help-container-color onair"></div>
              <div class="help-container-text">OnAir Zone</div>
          </div>
          `
          this.sweetbox.fire({
              width: 260,
              titleText: 'Group Information',
              html: content
          });
      }
    },
    created() {
        console.log("Create list view ", this.groupList);
        EventBus.$on('g-close-infowindow', (v) => {
            this.selectedSoundId = '';
            this.checkedGroupList = [];
        })
    },
    mounted() {
    },
    watch: {
        selectedSoundId : function() {
          if (this.selectedSoundId !== '')  {
              this.disabledMic = true;
              this.disabledSound = false;
          } else {
              this.disabledMic = false;
              this.disabledSound = true;
          }
        }
    }
}
</script>
<style>
.list-main-container {
    position: absolute;
    width: 250px;
    height: 100%;
}
.list-main-frame {
    width: 250px;
    height: 100%;
    position: absolute;
    /* top: 1em; */
    /* left: 1em; */
    /* border-radius: 15px; */
    overflow-x: hidden;
    overflow-y: scroll;
}
.list-top-frame1 {
    position: relative;
    width: 100%;
    height: 4.8em;
    background-color: rgb(210, 235, 250);
}
.list-top-frame {
    position: relative;
    width: 100%;
    height: 2.4em;
    background-color: rgb(210, 235, 250);
}
.list-text {
    /* position: absolute; */
    /* left: 1em; */
    /* top: 50%; */
    /* transform: translateY(-50%); */
    padding-top: 2px;
    padding-left: 6px;
    color: black;
    font-weight: bold;
    font-size: 1.4em;
    letter-spacing: .4px;
}
.list-button {
    position: absolute;
    width: .7em;
    height: .7em;
    top: 40%;
    transform: translateY(-50%);
    right: 1em;
}
.list-alarm-frame {
    position: relative;
    width: 100%;
    height: 200px;
    /* height: calc(100% - 2.5em); */
    overflow-x: hidden;
    overflow-y: scroll;
    background: white;
}
.list-alarm-left-title {
  width: 50%;
  display: inline-block;
}
.list-alarm-right-title {
  width: 50%;
  display: inline-block;
  text-align: right;
  padding-right: 15px;
}
.list-group-frame {
    position: relative;
    width: 100%;
    height: 200px;
    /* height: calc(100% - 2.5em); */
    overflow-x: hidden;
    overflow-y: scroll;
    background: white;
}
.left-group-frame-help-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    width: 24px;
    height: 24px;
    cursor: pointer;
}
.left-group-frame-help-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../assets/imgs/question.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
.list-reserve-frame {
    position: relative;
    width: 100%;
    height: 180px;
    /* height: calc(100% - 2.5em); */
    overflow-x: hidden;
    overflow-y: scroll;
    background: white;
}
.left-icon-image {
  width: 50%;
  height: 100%;
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  display: inline-block;
  cursor: pointer;
}
.left-icon-image.play-icon {
  background-size: 40%;
  background-image: url('../assets/imgs/play.svg');
}
.left-icon-image.play-icon:hover {
  background-size: 44%;
  background-image: url('../assets/imgs/play.svg');
}
.left-icon-image.playDisabled {
  background-size: 40%;
  background-image: url('../assets/imgs/play-disabled.png');
  cursor: default;
}
.left-icon-image.playDisabled:hover {
  background-size: 40%;
  background-image: url('../assets/imgs/play-disabled.png');
  cursor: default;
}
.left-icon-image.mic-icon {
  background-size: 40%;
  background-image: url('../assets/imgs/microphone.svg');
}
.left-icon-image.mic-icon:hover {
  background-size: 44%;
  background-image: url('../assets/imgs/microphone.svg');
}
.left-icon-image.micDisabled {
  background-size: 40%;
  background-image: url('../assets/imgs/muted.svg');
  cursor: default;
}
.left-icon-image.micDisabled:hover {
  background-size: 40%;
  background-image: url('../assets/imgs/muted.svg');
  cursor: default;
}
.help-container {
    text-align: left;
}
.help-container-color {
    width: 14px;
    height: 14px;
    display: inline-block;
    margin-left: 40px;
    margin-right: 20px;
}
.help-container-color.define {
    background: rgb(25, 255, 25);
}
.help-container-color.select {
    background: rgb(235, 255, 25);
}
.help-container-color.onair {
    background: rgb(255, 75, 25);
}
.help-container-text {
    display: inline-block;
    text-align: left;
    font-size: 1.6em;
    font-weight: 400;
    line-height: normal;
}

</style>
