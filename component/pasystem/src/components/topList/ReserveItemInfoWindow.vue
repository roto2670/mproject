<template>
    <div id="infowindow" class="reserve-item-info-container">
        <div class="reserve-item-info-panel">
            <div class="reserve-item-top-frame">
                <div class="reserve-item-title">{{ getItemName }}</div>
                <div class="reserve-item-text">{{ getItemInfo }}</div>
                <div class="reserve-item-repeat-button">
                    <div class="reserve-item-repeat-image" :class="{ nonRepeat: !isRepeat }"></div>
                </div>
                <div v-if="isRepeat" class="reserve-item-play-button">
                    <div class="reserve-item-play-image" :class="{ pause: !isPause }"
                    @click="handlePauseButton"></div>
                </div>
                <div class="reserve-item-trash-button">
                    <div class="reserve-item-trash-image"
                    @click="handleRemoveButton"></div>
                </div>
            </div>
            <div class="reserve-item-frame">
                <ReserveItemInfoItem v-for="id in reserve.group_id_list"
                :key="id" :id="id"></ReserveItemInfoItem>
            </div>
        </div>
    </div>
</template>
<script>
import ReserveItemInfoItem from '@/components/reserveItemInfoItem';
import { EventBus } from "@/main";
export default {
    name: 'ReserveItemInfoWindow',
    components: {
        ReserveItemInfoItem
    },
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            reserve: {},
            alarm: {},
            pause: false
        }
    },
    methods: {
        handlePauseButton(e) {
            e.stopPropagation();
            let isPause = !this.reserve.pause;
            this.$emit('select-pause', this.id, isPause);
        },
        handleRemoveButton(e) {
            e.stopPropagation();
            this.$emit('select-remove', [this.id]);
        }
    },
    computed: {
        getItemName() {
            return `${ this.reserve.name }`;
        },
        getItemInfo() {
            return `${ this.reserve.hour } : ${ this.reserve.minute } ( ${ this.alarm.name } )`;
        },
        isRepeat() {
            if (this.reserve.repeat === 0) {
                return false;
            } else {
                return true;
            }
        },
        isPause() {
            return this.pause;
        }
    },
    created() {
        this.reserve = this.$store.getters.getReserveAlarmData(this.id);
        this.alarm = this.$store.getters.getAlarmData(this.reserve.alarm_id);
        EventBus.$emit('g-open-reserve-infowindow', true);
        EventBus.$emit('g-open-reserve-item-infowindow', this.reserve.group_id_list);
        EventBus.$on('g-reserve-item-pause', (v) => {
            this.reserve = v;
            if (this.reserve.pause === 0) {
                this.pause = false;
            } else {
                this.pause = true;
            }
        })
        if (this.reserve.pause === 0) {
            this.pause = false;
        } else {
            this.pause = true;
        }
    },
    destroyed() {
        EventBus.$emit('g-close-reserve-infowindow', true);
        EventBus.$emit('g-close-reserve-item-infowindow', this.reserve.group_id_list);
    }
}
</script>
<style>
.reserve-item-info-container {
    position: absolute;
    width: 300px;
    height: 320px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 10px 10px 25px #aaaaaa;
    z-index: 2;
    border-radius: 10px;
}
.reserve-item-info-panel {
    display: inline-block;
    width: 300px;
    height: 320px;
    color: black;
    font-weight: 500;
    background-color: rgb(255, 255, 255);
    font-size: large;
    letter-spacing: 1px;
    overflow-x: hidden;
    overflow-y: scroll;
}
.reserve-item-top-frame {
    position: relative;
    width: 100%;
    height: 80px;
    background-color: rgb(210, 235, 250);
}
.reserve-item-title {
    padding-top: 6px;
    padding-left: 6px;
    color: black;
    font-weight: bold;
    font-size: 1.4em;
    letter-spacing: .4px;
    text-align: center;
}
.reserve-item-text {
    padding-top: 6px;
    padding-left: 6px;
    color: black;
    font-size: 1em;
    letter-spacing: .4px;
    text-align: center;
}
.reserve-item-frame {
    position: relative;
    width: 100%;
    height: 280px;
    overflow-x: hidden;
    overflow-y: scroll;
    background: white;
}
.reserve-item-repeat-button {
    position: absolute;
    top: 20%;
    transform: translateY(-50%);
    right: 10px;
    width: 20px;
    height: 20px;
    cursor: default;
}
.reserve-item-repeat-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/repeat.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
.reserve-item-repeat-image.nonRepeat {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/non-repeat.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
.reserve-item-trash-button {
    position: absolute;
    top: 80%;
    transform: translateY(-50%);
    right: 10px;
    width: 20px;
    height: 20px;
    cursor: pointer;
}
.reserve-item-trash-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/trash.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
.reserve-item-play-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    width: 20px;
    height: 20px;
    cursor: pointer;
}
.reserve-item-play-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/reserve-play.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
.reserve-item-play-image.pause {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/reserve-pause.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
</style>