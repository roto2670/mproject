<template>
    <div id="playlist" class="alarm-container">
        <div class="alarm-list-frame">
            <div class="alarm-list-wrapper">
                <div v-if="isMicType" class="live-record-streaming">
                    <div class="live-record-text">
                        MICROPHONE BROADCAST
                    </div>
                </div>
                <div v-else v-for="(data, index) in alarmList" :key="index"
                class="alarm-list-panel" :class="{ selected: isSelectedItem(data) }">
                    <div class="alarm-name-panel">
                        <div class="alarm-name"
                         :class="{ selected: isSelectedItem(data) }"> {{ data.name }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="alarm-play-frame">
            <div v-if="isMicType" class="play-icon-panel">
                <div class="icon-image mic-icon" @click="handleStartPlay"
                    :class="{ stopMic: isPlaying() }"></div>
            </div>
            <div v-else class="play-icon-panel">
                <div class="icon-image play-icon" @click="handleStartPlay"
                    :class="{ stopIcon: isPlaying() }"></div>
            </div>
            <div class="volume-down-panel">
                <div class="icon-image volume-down" @click="handleVolumeDown"></div>
            </div>
            <div class="volume-up-panel">
                <div class="icon-image volume-up" @click="handleVolumeUp"></div>
            </div>
        </div>
    </div>
</template>
<script>
import { EventBus } from "@/main";
export default {
    name: 'GroupPlayList',
    props: {
        list: {
            type: Array,
            detault: []
        },
        soundItemId: {
            type: String
        },
        onAir: {
            type: Boolean
        }
    },
    data() {
        return {
            selectedItem: null,
            context: null,
            recorder: null,
            audioInput: null,
            recordingLength: null,
            leftchannel: [],
            rightchannel: [],
            recordingLength: 0,
            sampleRate: 44100,
            blob: null,
            uuid: null,
            soundVolume: 80,
            isPlayed: false,
            alarmList: [],
            disabled: this.onAir,
            isOnAir: this.onAir
        }
    },
    methods: {
        isSelectedItem(item) {
            if (item === `record`) {
                return this.selectedItem === `record`;
            } else {
                return !!this.selectedItem && this.selectedItem.id === item.id;
            }
        },
        isPlaying() {
            if (this.selectedItem === `record`) {
                return (this.context !== null);
            } else {
                return this.isPlayed;
            }
        },
        handleSelectedItem(item) {
            if (!this.disabled) {
                if (item === `record`) {                 //TODO: command 푸시면 alarm이나 streaming이 선택될 수 있습니다.
                    if (!!!this.selectedItem) {
                        this.selectedItem = `record`;
                    } else {
                        if (this.isPlaying()) {
                            this.handlePauseRecord();
                        }
                        this.selectedItem = null;
                    }
                } else if (!!!this.selectedItem || this.selectedItem.id !== item.id) {
                    this.selectedItem = item;
                } else {
                    if (!this.isOnAir) {
                        this.selectedItem = null;
                    }
                }
            }
        },
        getUUID() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 3 | 8);
            return v.toString(16);
          });
        },
        handleStartPlay() {
            if (!this.disabled) {
                this._handleStartPlay();
            }
        },
        _handleStartPlay() {
            const isStatus = this.$store.getters.getStreamingStatus,
                  nowStatus = this.$store.getters.getNowPlaying,
                  data = {};
            if (this.uuid == null) {
                this.uuid = this.getUUID();
            }
            data.selectedItem = this.selectedItem;
            data.uuid = this.uuid;
            data.volume = this.soundVolume;
            if (this.selectedItem === `record`) {
                if (!!!this.context) {
                    this._checkAccessMicrophone((permissionState) => {
                        if (permissionState === window.CONSTANTS.MICROPHONE_ACCESS_STATE.DENIED) {
                            console.log("Denied microphone access");
                        } else {
                            if (!!!this.isOnAir) {
                                this.$emit('select-speaker', data);
                                this.$store.commit('updateNowPlaying', window.CONSTANTS.PLAY_STATUS.MY_STREAM);
                                this._requireAccess();
                                this.nowPlaying = this.selectedItem;
                            } else {
                                this.sweetbox.fire("The streaming stop is currently in progress. Wait a second, please.")
                            }
                        }
                    });
                } else {
                    if (isStatus && nowStatus == 1) {
                        this.handlePauseRecord();
                    } else if (isStatus && nowStatus == 2) {
                        this.sweetbox.fire("Another user is broadcasting first. Please try again later.")
                    }
                }
            } else if (!!this.selectedItem) {
                console.log("Success to send Record", this.selectedItem);
                if (this.uuid == null) {
                    this.uuid = this.getUUID();
                }
                const data = {}
                data.selectedItem = this.selectedItem;
                data.uuid = this.uuid;
                data.volume = this.soundVolume;
                this.$store.commit('updateNowPlaying', 1);
                this.$emit('select-speaker', data);
                if (isStatus && nowStatus == 1) {
                    this.handlePauseRecord();
                } else if (isStatus && nowStatus == 2) {
                    this.sweetbox.fire("Another user is broadcasting first. Please try again later.")
                } else {
                    this.isPlayed = true;
                    setTimeout(this.handleIsPlayed, 5000);
                }
            } else {
                console.log("Theres no item to play");
            }
        },
        handleIsPlayed() {
            const streamingStatus = this.$store.getters.getStreamingStatus;
            if (streamingStatus) {
                setTimeout(this.handleIsPlayed, 3000);
            } else {
                this.selectedItem = null;
                this.isPlayed = false;
            }
        },
        handlePauseRecord() {
            if (this.selectedItem === `record`) {
                if (!!this.context) {
                    this.context.close();
                    this.audioInput.disconnect();
                    this.recorder.disconnect();
                    this.blobToWav();
                    this.context = null;
                    this.recorder = null;
                    this.audioInput = null;
                    this.recordingLength = 0;
                    this.leftchannel =  [],
                    this.rightchannel =  [],
                    this.blob = null;
                    this.uuid = null;
                    this.isPlayed = false;
                    this.services.stopStreamVoice(() => {
                        console.log("Success to stop voice stream");
                    }, (error) => {
                        console.log("Failed to stop voice stream");
                    });
                }
            } else {
                this.selectedItem = null;
                this.isPlayed = false;
            }
        },
        streamPosting() {
            if (!!this.context) {
                this.blobToWav();
                this.recordingLength = 0;
                this.leftchannel = [],
                this.rightchannel = [],
                this.blob = null;
            }
        },
        blobToWav() {
            var leftBuffer = this.flattenArray(this.leftchannel, this.recordingLength);
            var rightBuffer = this.flattenArray(this.rightchannel, this.recordingLength);
            var interleaved = this.interleave(leftBuffer, rightBuffer);
            var buffer = new ArrayBuffer(44 + interleaved.length * 2);
            var view = new DataView(buffer);
            this.writeUTFBytes(view, 0, 'RIFF');
            view.setUint32(4, 44 + interleaved.length * 2, true);
            this.writeUTFBytes(view, 8, 'WAVE');
            this.writeUTFBytes(view, 12, 'fmt ');
            view.setUint32(16, 16, true); // chunkSize
            view.setUint16(20, 1, true); // wFormatTag
            view.setUint16(22, 2, true); // wChannels: stereo (2 channels)
            view.setUint32(24, this.sampleRate, true); // dwSamplesPerSec
            view.setUint32(28, this.sampleRate * 4, true); // dwAvgBytesPerSec
            view.setUint16(32, 4, true); // wBlockAlign
            view.setUint16(34, 16, true); // wBitsPerSample
            // data sub-chunk
            this.writeUTFBytes(view, 36, 'data');
            view.setUint32(40, interleaved.length * 2, true);
            // write the PCM samples
            var index = 44;
            var volume = 1;
            for (var i = 0; i < interleaved.length; i++) {
                view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
                index += 2;
            }
            // our final blob
            this.blob = new Blob([view], { type: 'audio/wav' });

            this.services.voiceStream(this.blob, this.uuid, this.soundVolume, () => {
              console.log('Success to send blob');
            }, (error) => {
              console.warn('Failed to send blob data');
            });
        },
        flattenArray(channelBuffer, recordingLength) {
            var result = new Float32Array(recordingLength);
            var offset = 0;
            for (var i = 0; i < channelBuffer.length; i++) {
                var buffer = channelBuffer[i];
                result.set(buffer, offset);
                offset += buffer.length;
            }
            return result;
        },
        interleave(leftChannel, rightChannel) {
            var length = leftChannel.length + rightChannel.length;
            var result = new Float32Array(length);
            var inputIndex = 0;
            for (var index = 0; index < length;) {
                result[index++] = leftChannel[inputIndex];
                result[index++] = rightChannel[inputIndex];
                inputIndex++;
            }
            return result;
        },
        writeUTFBytes(view, offset, string) {
            for (var i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        },
        _checkAccessMicrophone(resultCallback) {
            navigator.permissions.query({
                name: 'microphone'
            }).then(result => {
                resultCallback(result.state);
            });
        },
        _requireAccess() {
            navigator.mediaDevices.getUserMedia({
                audio: true
            }).then((stream) => {
                this.context = new AudioContext();
                this.audioInput = this.context.createMediaStreamSource(stream);
                var bufferSize = 4096;

                this.recorder = this.context.createScriptProcessor(bufferSize, 2, 2);
                this.audioInput.connect(this.recorder);
                this.recorder.connect(this.context.destination);
                this.recorder.onaudioprocess = (e) => {
                    this.leftchannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
                    this.rightchannel.push(new Float32Array(e.inputBuffer.getChannelData(1)));
                    this.recordingLength += bufferSize;
                    if (this.recordingLength == 40960) {
                        this.streamPosting();
                    }
                };
            }, (error) => {
                console.log("error : ", error);
            })
        },
        convertoFloat32ToInt16(buffer) {
            var l = buffer.length;  //Buffer
            var buf = new Int16Array(l/3);

            while (l--) {
                var s = Math.max(-1, Math.min(1, buffer[l]));
                buf[l] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                //buf[l] = buffer[l]*0xFFFF; //old   //convert to 16 bit
            }

            return buf.buffer;
        },
        handleVolumeUp() {
            if (!this.disabled) {
                if (this.soundVolume < 100) {
                    this.soundVolume += 5
                    console.log("Volume Up", this.soundVolume);
                } else {
                    console.log("Volume MAX", this.soundVolume);
                }
                this.$emit('select-volume', this.soundVolume);
            }
        },
        handleVolumeDown() {
            if (!this.disabled) {
                if (this.soundVolume > 0){
                    this.soundVolume -= 5
                    console.log("Volume Down", this.soundVolume);
                } else {
                    console.log("Volume Mute", this.soundVolume);
                }
                this.$emit('select-volume', this.soundVolume);
            }
        },
    },
    computed: {
        isMicType() {
            return this._.isEmpty(this.alarmList);
        }
    },
    created() {
        if (this.soundItemId !== "") {
            const alarm = this.$store.getters.getAlarmData(this.soundItemId)
            this.alarmList = [alarm];
            this.selectedItem = alarm;
        } else {
            this.alarmList = [];
            this.selectedItem = `record`;
        }
        EventBus.$on('g-streaming-status', (v) => {
            const nowStatus = this.$store.getters.getNowPlaying;
            if (nowStatus !== window.CONSTANTS.PLAY_STATUS.MY_STREAM) {
                if (v.status) {
                    this.disabled = true;
                } else {
                    this.disabled = false;
                }
            }
            this.isOnAir = v.status;
        })

    }
}
</script>
<style>
.alarm-container {
    position: relative;
    width: 100%;
    height: 100%;
}
.alarm-list-frame {
    position: absolute;
    width: 100%;
    height: calc(100% - 90px);
    overflow-y: scroll;
    overflow-x: hidden;
}
.alarm-list-wrapper {
    margin: 14px;
}
.live-record-streaming {
    width: 100%;
    height: 40px;
    background-color: rgb(207, 83, 85);
    border-radius: 18px;
    cursor: default;
}
.live-record-streaming.liveRecord {
    background-color: #ffb3b3;
}
.live-record-border {
    border: 1.5px solid white;
    border-radius: 15px;
    width: 97%;
    height: 75%;
    transform: translateX(1%) translateY(10%);
}
.live-record-border.liveRecordStarts {
   border: 1.5px solid rgb(207, 83, 85);
}
.live-record-text {
    font-size: initial;
    color: white;
    width: 100%;
    height: 100%;
    text-align: center;
    transform: translateY(20%);
}
.live-record-text.liveRecordStart{
    color: rgb(207, 83, 85);
}
.alarm-list-panel {
    position: relative;
    width: 120px;
    height: 68px;
    border: 2px solid rgb(230, 110, 110);
    border-radius: 10px;
    display: inline-block;
    margin: 7px;
    cursor: pointer;
}
.alarm-list-panel.selected {
    background-color: rgb(230, 110, 110);
}
.alarm-name-panel {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    text-align: center;
}
.alarm-name {
    font-size: 20px;
    user-select: none;
    color: black;
    overflow: hidden;
    text-overflow: ellipsis;
}
.alarm-name.selected {
    color: white;
}
.alarm-play-frame {
    position: absolute;
    width: 100%;
    height: 90px;
    bottom: 0;
    background-color: rgb(235, 230, 230);
}
.play-icon-panel {
    position: absolute;
    width: 90px;
    height: 90px;
    border: 1.5px solid rgb(207, 83, 85);
    border-radius: 50px;
    bottom: 20px;
    left: 35px;
    box-shadow: 3px 6px 5px rgba(0, 0, 0, 0.1);
}
.icon-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center center;
    cursor: pointer;
}
.icon-image.play-icon {
    background-size: 99%;
    background-image: url('../assets/imgs/icon-play.svg');
}
.icon-image.play-icon:active {
    background-size: 102%;
    background-image: url('../assets/imgs/icon-play(active).svg');
}
.icon-image.stopIcon {
    background-size: 102%;
    background-image: url('../assets/imgs/icon-stop.png');
}
.icon-image.mic-icon {
    background-size: 70%;
    background-image: url('../assets/imgs/microphone.svg');
    background-color: rgb(255, 255, 255);
    border-radius: 100%;
}
.icon-image.stopMic {
    background-size: 75%;
    background-image: url('../assets/imgs/muted.svg');
    background-color: rgb(255, 255, 255);
    border-radius: 100%;
}
.volume-down-panel {
    position: absolute;
    width: 50px;
    height: 50px;
    margin: 20px;
    right: 70px;
}
.icon-image.volume-down {
    cursor: pointer;
    background-image: url('../assets/imgs/icon-volume-down.svg');
}
.icon-image.volume-down:active {
    cursor: pointer;
    background-image: url('../assets/imgs/icon-volume-down(active).svg');
}
.volume-up-panel {
    position: absolute;
    width: 50px;
    height: 50px;
    margin: 20px;
    right: 0;
}
.icon-image.volume-up {
    cursor: pointer;
    background-image: url('../assets/imgs/icon-volume-up.svg');
}
.icon-image.volume-up:active {
    cursor: pointer;
    background-image: url('../assets/imgs/icon-volume-up(active).svg');
}
</style>
