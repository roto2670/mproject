<template>
    <div id="playlist" class="alarm-container">
        <div class="alarm-list-frame">
            <div class="alarm-list-wrapper">
                <div class="live-record-streaming" @click="handleSelectedItem(`record`)"
                    :class="{ liveRecord: isSelectedItem(`record`)}">
                    <div class="live-record-text" :class="{ liveRecordStart: isSelectedItem(`record`)}">
                        START BROADCAST
                    </div>
                </div>
                <div v-for="(data, index) in list" :key="index"
                class="alarm-list-panel" :class="{ selected: isSelectedItem(data) }"
                @click="handleSelectedItem(data)">
                    <div class="alarm-name-panel">
                        <div class="alarm-name"
                         :class="{ selected: isSelectedItem(data) }"> {{ data.name }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="alarm-play-frame">
            <div class="play-icon-panel">
                <div class="icon-image play-icon" @click="handleStartPlay"></div>
            </div>
            <div class="volume-down-panel">
                <div class="icon-image volume-down"></div>
            </div>
            <div class="volume-up-panel">
                <div class="icon-image volume-up"></div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'PlayList',
    props: {
        list: {
            type: Array,
            detault: []
        }
    },
    data() {
        return {
            selectedItem: null,
            context: null,
            recorder: null
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
        handleSelectedItem(item) {
            // if (item === `record`) {                 //TODO: command 푸시면 alarm이나 streaming이 선택될 수 있습니다.
            //     if (!!!this.selectedItem) {
            //         this.selectedItem = `record`;
            //     } else {
            //         this.selectedItem = null;
            //     }
            // } else if (!!!this.selectedItem || this.selectedItem.id !== item.id) {
            //     this.selectedItem = item;
            // } else {
            //     this.selectedItem = null;
            // }
            console.log("selected item", item);
        },
        handleStartPlay() {
            if (this.selectedItem === `record`) {
                if (!!!this.context) {
                    this._checkAccessMicrophone((permissionState) => {
                        if (permissionState === window.CONSTANTS.MICROPHONE_ACCESS_STATE.DENIED) {
                            console.log("Denied microphone access");
                        } else {
                            this._requireAccess();
                        }
                    });
                } else {
                    this.handlePauseRecord();
                }
            } else if (!!this.selectedItem) {
                console.log("Success to send Record");
                this.$emit('select-speaker', this.selectedItem);
            } else {
                console.log("Theres no item to play");
            }
        },
        handlePauseRecord() {
            if (!!this.context) {
                this.context.close();
                this.recorder.disconnect();
                this.context = null;
                this.selectedItem = null;
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
                var audioInput = this.context.createMediaStreamSource(stream);
                var bufferSize = 2048;

                this.recorder = this.context.createScriptProcessor(bufferSize, 1, 1);

                this.recorder.onaudioprocess = (e) => {
                    var mic = e.inputBuffer.getChannelData(0);
                    var convert = this.convertoFloat32ToInt16(mic);
                    console.log("mic", convert);
                };

                audioInput.connect(this.recorder);
                this.recorder.connect(this.context.destination);
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
    },
    created() {
        console.log("create play list ", this.list);
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
    cursor: pointer;
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
    transform: translateY(30%);
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
}
.icon-image.play-icon {
    background-size: 99%;
    background-image: url('../assets/imgs/icon-play.svg');
}
.icon-image.play-icon:active {
    background-size: 102%;
    background-image: url('../assets/imgs/icon-play(active).svg');
}
.volume-down-panel {
    position: absolute;
    width: 50px;
    height: 50px;
    margin: 20px;
    right: 70px;
}
.icon-image.volume-down {
    background-image: url('../assets/imgs/icon-volume-down.svg');
}
.icon-image.volume-down:active {
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
    background-image: url('../assets/imgs/icon-volume-up.svg');
}
.icon-image.volume-up:active {
    background-image: url('../assets/imgs/icon-volume-up(active).svg');
}
</style>
