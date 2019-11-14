<template>
    <div id="infowindow" class="reserve-info-container">
        <div class="reserve-info-panel group">
            <div class="reserve-top-frame">
                  <div class="reserve-text">Group</div>
            </div>
            <div class="reserve-list-frame">
                <GroupItem v-for="groupId in groupList" :key="groupId" :id="groupId"
                @select-checkbox="handleChangeGroupCheckbox"></GroupItem>
            </div>
        </div>
        <div class="reserve-info-panel sound">
            <div class="reserve-top-frame">
                  <div class="reserve-text">Sound</div>
            </div>
            <div class="reserve-list-frame">
                <SoundItem v-for="soundId in alarmList" :key="soundId" :id="soundId"
                @select-radio-button="handleChangeSoundRadioButton"></SoundItem>
            </div>
        </div>
        <div class="reserve-info-panel time">
            <div class="reserve-top-frame">
                  <div class="reserve-text">Time</div>
            </div>
            <div class="reserve-list-frame">
                <ReserveTimeItem v-for="(type, index) in types"
                :key="index" :type="type" @change-time="handleSelectTime"></ReserveTimeItem>
            </div>
        </div>
        <div class="reserve-info-panel button">
            <div class="reserve-top-frame">
                  <div class="reserve-text">Button</div>
            </div>
            <div class="reserve-list-frame">
                <input type="text" class="reserve-name-input" placeholder="Input name" v-model="name"/>
                <div class="create-button-panel" @click="selectedAddReserve">
                    <div class="create-button-text">CREATE</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import GroupItem from '@/components/topList/ReserveWindowGroupItem';
import SoundItem from '@/components/topList/ReserveWindowSoundItem';
import ReserveTimeItem from '@/components/topList/ReserveWindowTimeItem';
import { EventBus } from "@/main";
export default {
    name: 'ReserveWindow',
    components: {
        GroupItem,
        SoundItem,
        ReserveTimeItem
    },
    props: {
        groupList: {
            type: Array,
            default: []
        },
        alarmList: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            types: ['hour', 'minute', 'type', 'repeat'],
            data: {
                hour: 0,
                minute: 0,
                type: 0,
                repeat: 0,
                alarmId: '',
                groupList: [],
                name: ''
            },
            name: ''
        }
    },
    methods: {
      handleChangeGroupCheckbox(groupId, checked) {
          if (checked) {
              this.data['groupList'].push(groupId);
          } else {
              this.data['groupList'] = this._.without(this.data['groupList'], groupId);
          }
      },
      handleChangeSoundRadioButton(alarmId) {
          this.data['alarmId'] = alarmId;
      },
      handleSelectTime(type, value) {
          this.data[type] = value;
      },
      selectedAddReserve(e) {
          e.stopPropagation();
          if (this.name == '') {
              this.name = "" + this.data.hour + ":" + this.data.minute;
          }
          this.data.name = this.name;
          this.$emit('select-add-reserve', this.data);
      }
    },
    computed: {
    },
    created() {
    },
    destroyed() {
    }
}
</script>
<style>
.reserve-info-container {
    position: absolute;
    width: 1000px;
    height: 320px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 10px 10px 25px #aaaaaa;
    z-index: 2;
    border-radius: 10px;
}
.reserve-info-panel {
    display: inline-block;
    width: 250px;
    height: 320px;
    color: black;
    font-weight: 500;
    /* background-color: rgb(250, 115, 120); */
    background-color: rgb(255, 255, 255);
    font-size: large;
    letter-spacing: 1px;
    overflow-x: hidden;
    overflow-y: scroll;
}
.reserve-info-panel.group {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    border-right: 1px solid rgb(235, 235, 235);
}
.reserve-info-panel.sound {
    border-right: 1px solid rgb(235, 235, 235);
}
.reserve-info-panel.time {
    border-right: 1px solid rgb(235, 235, 235);
}
.reserve-info-panel.button {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}
.reserve-top-frame {
    position: relative;
    width: 100%;
    height: 2.4em;
    background-color: rgb(210, 235, 250);
}
.reserve-text {
    padding-top: 6px;
    padding-left: 6px;
    color: black;
    font-weight: bold;
    font-size: 1.4em;
    letter-spacing: .4px;
    text-align: center;
}
.reserve-list-frame {
}
.create-button-panel {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 2.4em;
    background-color: rgb(85, 185, 250);
    color: white;
    cursor: pointer;
}
.create-button-text {
    padding-top: 6px;
    padding-left: 6px;
    font-weight: bold;
    font-size: 1.4em;
    letter-spacing: .4px;
    text-align: center;
}
.reserve-name-input {
    width: 100%;
    height: 2.4em;
    font-size: 18px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
}
</style>