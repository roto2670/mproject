<template>
    <div id="reservelist" class="reserve-container">
        <div v-if="type !== 'scheduled'" class="back-container"
        @click="handleBackButton">
            <div class="back-frame">
                <div class="back-image"></div>
                <div class="back-text"> {{ text }}</div>
            </div>
        </div>
        <div v-if="isShowing('scheduled')">
            <SoundList v-if="isEmpty"
            :list="list" @select-add="selectedAddReserve"
            @select-remove="selectedRemoveReserve" :class="{ reserve: true }"></SoundList>
            <div v-else class="reserve-list-container">
                <div class="list-wrapper">
                <ReserveItem v-for="id in list" :key="id"
                :id="id" @select-checkbox="handleSelectCheckbox"></ReserveItem>
                </div>
                <div class="sound-button-wrapper">
                    <div class="sound-button-panel" @click="selectedAddReserve">
                        <div class="sound-button-text">ADD NEW</div>
                    </div>
                    <div class="sound-button-panel right"
                    @click="selectedRemoveReserve" :class="{ deactive: deactive }">
                        <div class="sound-button-text">REMOVE</div>
                    </div>
                </div>
            </div>
        </div>
        <GroupList v-else-if="isShowing('group') || isShowing('sound')"
        :checkList="checkList" :type="type"
        :class="{ reserve: true }"
        @select-checkbox="handleChangedCheckBox"
        @select-button="handleSelectedButton">
        </GroupList>
        <ReserveTimeList v-else-if="isShowing('reserve_time')"
        @finish="handleSelectFinish"></ReserveTimeList>
    </div>
</template>
<script>
import SoundList from '@/components/topList/SoundList';
import GroupList from '@/components/topList/GroupList';
import ReserveTimeList from '@/components/topList/ReserveTimeList';
import ReserveItem from '@/components/topList/ReserveItem';
export default {
    name: 'ReserveList',
    components: {
        SoundList,
        GroupList,
        ReserveTimeList,
        ReserveItem
    },
    props: {
        list: {
            type: Array
        }
    },
    data() {
        return {
            checkList: [],
            reserveOption: {},
            typeList: this._.values(window.CONSTANTS.RESERVE_TYPE),
            type: window.CONSTANTS.RESERVE_TYPE.SCHEDULED_BROADCAST
        }
    },
    methods: {
        selectedAddReserve() {
            console.log("Select reserve add");
            this.type = window.CONSTANTS.RESERVE_TYPE.GROUP;
        },
        selectedRemoveReserve() {
            this.$emit('select-remove', this.checkList);
            this.checkList = [];
        },
        handleSelectCheckbox(id) {
            if (!this._.includes(this.checkList, id)) {
                this.checkList.push(id);
            } else {
                this.checkList = this._.without(this.checkList, id);
            }
        },
        handleChangedCheckBox(item, checked) {
            if (checked) {
                this.checkList = [item];
            } else {
                this.checkList = [];
            }
        },
        handleSelectedButton(list) {
            this.reserveOption[this.type] = list;
            this._next();
            console.log("selected button", this.reserveOption);
        },
        isShowing(type) {
            return this.type === type;
        },
        handleBackButton() {
            this._previous();
        },
        handleSelectFinish(data) {
            this.reserveOption[this.type] = data;
            this.$emit('select-button', this.reserveOption);
        },
        _next() {
            let index = this._.indexOf(this.typeList, this.type);
            this.type = '';
            this.$nextTick(() => {
                index += 1;
                this.type = this.typeList[index];
            });
        },
        _previous() {
            let index = this._.indexOf(this.typeList, this.type);
            this.type = '';
            this.$nextTick(() => {
                index -= 1;
                this.type = this.typeList[index];
            });
        }
    },
    computed: {
        isEmpty() {
            return this._.isEmpty(this.list);
        },
        text() {
            let _text = ''
            if (this.type === window.CONSTANTS.RESERVE_TYPE.GROUP) {
                _text = 'SELECT A GROUP';
            } else if (this.type === window.CONSTANTS.RESERVE_TYPE.SOUND) {
                _text = `${ this.reserveOption.group.length } GROUPS`;
            } else if (this.type === window.CONSTANTS.RESERVE_TYPE.RESERVE_TIME) {
                _text = `${ this.reserveOption.group.length } GROUPS, ${ this.reserveOption.sound.length } SOUNDS`;
            }
            return _text;
        },
        deactive() {
            return this._.isEmpty(this.checkList);
        }
    },
    created() {
    }
}
</script>
<style>
.reserve-container {
}
.sound-container.reserve {
    left: 640px;
}
.group-container.reserve {
    left: 640px;
}
.back-container {
    position: absolute;
    width: 300px;
    height: 50px;
    left: 640px;
    z-index: 2;
    border-bottom: 1px solid rgb(223, 223, 233);
    cursor: pointer;
}
.back-frame {
    width: 100%;
    height: 100%;
}
.back-image {
    display: inline-block;
    width: 67px;
    height: 50px;
    background-image: url('../../assets/imgs/icon-back.svg');
    background-size: 27%;
    background-repeat: no-repeat;
    background-position: center center;
}
.back-text {
    position: absolute;
    top: 54%;
    left: 52px;
    transform: translateY(-50%);
    font-weight: bold;
    font-size: 20px;
    color: rgb(125, 125, 125);
}

.sound-button-wrapper {
    width: 100%;
    height: 60px;
}
.sound-button-panel {
    position: relative;
    display: inline-block;
    width: 50%;
    height: 100%;
    background-color: rgb(85, 185, 250);
    color: white;
    cursor: pointer;
}
.sound-button-panel.right {
    width: 50%;
    border-left: 2px solid rgb(81, 177, 237);
}
.sound-button-panel.deactive {
    pointer-events: none;
    background-color: rgb(204, 204, 204);
    color: rgb(177, 177, 177);
}
.sound-button-text {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    text-align: center;
    font-weight: bold;
    font-size: 15px;
}

.reserve-list-container {
    position: absolute;
    width: 300px;
    left: 650px;
    background-color: rgb(249, 249, 249);
    border: 1px solid rgb(223, 223, 233);
    border-radius: 10px;
    z-index: 1;
    overflow: hidden;

}

.list-wrapper {
    height: 180px;
    overflow-y: scroll;
}

</style>