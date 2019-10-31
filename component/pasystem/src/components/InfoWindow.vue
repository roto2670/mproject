<template>
    <div id="infowindow" class="info-container">
        <div class="info-left-panel">
            <div v-if="!isForGroup" class="info-speaker-panel">
                <div class="info-text-wrapper">
                    <div class="info-title">SPEAKER</div>
                    <div class="info-text">{{ item.name }}</div>
                    <div class="info-title group">GROUP</div>
                    <div class="info-text">{{ groupName() }}</div>
                    <div class="info-title group">VOLUME</div>
                    <div class="info-text">{{ this.soundVolume }}</div>
                </div>
                <div class="alarm-image-panel">
                    <div class="alarm-image"></div>
                </div>
            </div>
            <div v-else class="group-speaker-panel">
                <div class="group-text-wrapper">
                    <div class="info-title">GROUP</div>
                    <div class="group-wrapper">
                        <div v-for="(groupId, index) in item" :key="index"
                        class="info-text">{{ groupName(groupId) }}</div>
                    </div>
                    <div class="info-title">VOLUME</div>
                    <div class="info-text">{{ this.soundVolume }}</div>
                </div>
                <div class="group-list-panel">
                    <div class="group-list-title">
                        <div class="group-list-text">{{ `${ speakersInGroup.length } speakers` }}</div>
                    </div>
                    <div class="group-list-wrapper">
                        <div v-for="(speaker, index) in speakersInGroup"
                        :key="index" class="speaker-list-panel">
                            <div class="speaker-list-text">{{ speaker.name }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="info-right-panel">
            <PlayList :list="playList" @select-speaker="handleSelectSpeaker" @select-volume="handleVolume" ></PlayList>
        </div>
        <div class="info-close-button" @click="handleSelectCloseButton"></div>
    </div>
</template>
<script>
import PlayList from '@/components/PlayList';
const fileNotExist = "1";
export default {
    name: 'InfoWindow',
    components: {
        PlayList
    },
    props: {
        isForGroup: {
            type: Boolean
        },
        item: {
            required: true
        }
    },
    data() {
        return {
            playList: [],
            speakersInGroup: [],
            nowPlaying: null,
            soundVolume: 80
        }
    },
    methods: {
        handleGroupList() {
            const speakers = this.$store.getters.getSpeakers;
            this._.forEach(speakers, speaker => {
                const tag = this._.first(speaker.tags);
                if (this._.includes(this.item, tag)) {
                    this.speakersInGroup.push(speaker);
                }
            });
        },
        handleVolume(volume) {
            this.soundVolume = volume
        },
        handleSelectItem(index) {
            const item = this.playList[index];
            console.log("Select item : ", item);
        },
        handleSelectCloseButton() {
            this.$emit('select-close');
        },
        handleSelectSpeaker(data) {
            const jsondata = {}
            jsondata.uuid = data.uuid;
            jsondata.volume = data.volume;
            if (data.selectedItem == 'record'){
                jsondata.alarm_id = data.selectedItem;
                if (this.item.hasOwnProperty('id')) {
                    jsondata.type = '2';
                    jsondata.id = this.item.id;
                } else {
                    jsondata.type = '3';
                    jsondata.id = this.item;
                }
            } else {
                jsondata.alarm_id = data.selectedItem.id;
                if (this.item.hasOwnProperty('id')) {
                    jsondata.type = '0';
                    jsondata.id = this.item.id;
                } else {
                    jsondata.type = '1';
                    jsondata.id = this.item;
                }
            }
            if (this.nowPlaying == null) {
                const fileDel = this.services.removeAlarmData,
                      delFileData = {},
                      removeAlarmData = this.$store.commit;
                this.services.streamAlarm(jsondata, (resData) => {
                    console.log("Success to send Record item");
                    if (resData === fileNotExist) {
                        this.sweetbox.fire({
                          title: 'Alarm file does not exist.',
                          text: "There is no alarm file available to play. Please remove it from the list and re-register it. You want to delete it?",
                          type: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes, delete it!',
                          cancelButtonText: 'No, cancel!',
                          confirmButtonClass: 'btn btn-success',
                          cancelButtonClass: 'btn btn-danger',
                          buttonsStyling: true
                        }).then(function(isConfirm) {
                          if (isConfirm.value === true) {
                              delFileData.id_list = [jsondata.alarm_id];
                              fileDel(delFileData, (resp) => {
                                console.log("Succeed to remove alarm data");
                                removeAlarmData('removeAlarmData', jsondata.alarm_id);
                              }, (error) => {
                                console.log("Failed to remove alarm data ", error);
                              });
                          }
                        })
                    } else {
                        this.nowPlaying = data.selectedItem.id;
                        setTimeout(this.handleIsPlayed, 5000);
                    }
                }, (error) => {
                    console.log("Failed to send Record item");
                });
            } else {
                this.services.stopStreamAlarm(jsondata, () => {
                    console.log("Success to send Record item");
                    this.nowPlaying = null;
                }, (error) => {
                    console.log("Failed to send Record item");
                });
            }
        },
        handleIsPlayed() {
            const streamingStatus = this.$store.getters.getStreamingStatus;
            if (streamingStatus) {
                setTimeout(this.handleIsPlayed, 3000);
            } else {
                this.nowPlaying = null;
            }
        },
        groupName(data) {
            const id = !!data? data: this._.first(this.item.tags),
                  group = this.$store.getters.getGroup(id);
            if (!!group) {
                return group.name;
            }
            return 'None';
        }
    },
    computed: {

    },
    created() {
        if (this.isForGroup) {
            this.handleGroupList();
        }
        this.playList = this.$store.getters.getAlarmList;
    }
}
</script>
<style>
.info-container {
    position: absolute;
    width: 500px;
    height: 320px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 10px 10px 25px #aaaaaa;
    z-index: 2;
    border-radius: 10px;
}
.info-left-panel {
    width: 200px;
    height: 320px;
    color: black;
    font-weight: 500;
    background-color: rgb(250, 115, 120);
    font-size: large;
    position: absolute;
    letter-spacing: 1px;
    overflow: hidden;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
}
.info-speaker-panel {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
}
.info-text-wrapper {
    width: calc(100% - 50px);
    margin: 25px;
    user-select: none;
}
.info-title {
    text-align: left;
    font-size: 15px;
    opacity: .5;
    color: white;
}
.info-title.group {
    margin-top: 20px;
}
.info-text {
    text-align: left;
    font-size: 20px;
    font-weight: 900;
    margin-top: 5px;
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: white;
}
.info-button-wrapper {
    height: 180px;
    overflow: scroll;
    text-align: left;
    color: white;
    background-color: rgb(227 95 95);
}
.info-button-panel {
    height: 40px;
    overflow: hidden;
    text-align: left;
    font-size: 15px;
    padding-left: 12px;
    font-weight: 900;
    white-space: nowrap;
    text-overflow: ellipsis;
    position: relative;
    border-bottom: 2px solid rgb(250, 115, 120);
}
.info-button-title {
    display: inline-block;
    position: absolute;
    top: 50%;
    cursor: pointer;
    transform: translateY(-50%);
}
.info-close-button {
    position: absolute;
    background-size: 17px !important;
    background-color: rgba(255 117 117) !important;
    background-image: url('../assets/imgs/icon-close.svg');
    border-radius: 4px 4px 0 0!important;
    z-index: -1;
    height: 40px;
    width: 40px;
    background-repeat: no-repeat;
    background-position: center center;
    left: 90%;
    top: -12%;
    cursor: pointer;
}
.alarm-image-panel {
    position: absolute;
    width: 70px;
    height: 70px;
    left: 50%;
    bottom: -10px;
    transform: translateX(-50%) rotate(-20deg);
}
.alarm-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: url('../assets/imgs/icon-pa.svg');
}
.group-speaker-panel {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
}
.group-text-wrapper {
    width: calc(100% - 50px);
    height: 90px;
    margin: 25px;
    user-select: none;
}
.group-wrapper {
    width: 100%;
    max-height: 50px;
    overflow-y: scroll;
}
.group-list-panel {
    width: 100%;
    height: 180px;
}
.group-list-title {
    margin-left: 20px;
    text-align: left;
    height: 20px;
}
.group-list-text {
    font-size: 13px;
    color: white;
}
.group-list-wrapper {
    width: 100%;
    height: 180px;
    overflow-y: scroll;
}
.speaker-list-panel {
    position: relative;
    width: 100%;
    height: 50px;
    background-color: rgb(225, 95, 100);
    border-bottom: 1.5px solid rgb(250, 115, 120);
}
.speaker-list-text {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 20px;
    font-size: 18px;
    color: white;
}
.info-right-panel {
    width: 300px;
    height: 320px;
    margin-left: 200px;
    background-color: white;
    overflow: hidden;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}
</style>