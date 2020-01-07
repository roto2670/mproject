<template>
    <div id="group-list" class="group-container" :class="type">
        <div class="group-frame">
            <div v-if="type === 'group' || type === 'sound'"
            class="remain-container"></div>
            <GroupItem v-for="(value, key) in groupList"
            :key="key" :item="value" :filterList="checkList" :type="type"
            @select-checkbox="handleChangedCheckBox"
            @handle-remove="handleRemoveGroupItem"></GroupItem>
        </div>
        <div v-if="isShowingInput" class="group-item-panel add">
            <div class="group-add-frame">
                <div class="ga-left-frame">
                    <input type="text" class="ga-name-input" v-model="groupName" maxlength="30" />
                </div>
                <div class="ga-right-frame">
                    <div class="ga-button-panel" @click="handleAddGroup">
                        <div class="ga-button"></div>
                    </div>
                    <div class="ga-button-panel cancel" @click="handleAddCancel">
                        <div class="ga-button cancel"></div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type === 'broadcast' || type === 'group'
        || type === 'sound'" class="group-button-frame">
            <div class="group-button-panel" :class="{ deactive: isEmpty }"
            @click="handleSelectButton">
                <div class="group-button-text">{{ buttonText }}</div>
            </div>
        </div>
        <div v-else-if="type === 'group_set_up'"
        class="group-button-create-wrapper">
            <div class="group-button-create-panel" :class="{ deactive: !isEmpty }"
            @click="selectedAddGroup">
                <div class="group-create-button-text">CREATE</div>
            </div>
        </div>
    </div>
</template>
<script>
import GroupItem from '@/components/topList/GroupItem';
export default {
    name: 'GroupList',
    components: {
        GroupItem
    },
    props: {
        checkList: {
            type: Array,
            default: []
        },
        type: {
            type: String
        }
    },
    data() {
        return {
            allGroupKey: '-1',
            groupCheckList: [],
            groupList: {},
            groupName: '',
            isShowingInput: false
        }
    },
    methods: {
        handleChangedCheckBox(item, checked) {
            if (this.type === window.CONSTANTS.TOP_BUTTON_TYPE.FILTER) {
                this.$emit('select-checkbox', item, checked);
            } else if (this.type === 'sound') {
                if (checked) {
                    this.groupCheckList = [item];
                } else {
                    this.groupCheckList = [];
                }
                this.$emit('select-checkbox', item, checked);
            } else {
                if (!this._.includes(this.groupCheckList, item)) {
                    this.groupCheckList.push(item);
                } else {
                    this.groupCheckList = this._.without(this.groupCheckList, item);
                }
            }
        },
        handleSelectButton(e) {
            e.stopPropagation();
            this.$emit('select-button', this.groupCheckList);
        },
        selectedAddGroup() {
            console.log('add group');
            this.isShowingInput = !this.isShowingInput;
        },
        handleAddGroup() {
            const data = {
                    name: this.groupName
                }
            this.services.addGroupData(data, () => {
                this.isShowingInput = false;
                this.groupName = '';
                console.log("Succeed to add group data");
            }, (error) => {
                this.isShowingInput = false;
                this.groupName = '';
                console.warn("Failed to add group data ", error);
            });
            this.groupName = '';
        },
        handleAddCancel() {
            this.isShowingInput = false;
            this.groupName = '';
        },
        selectedRemove() {
            // TODO: button change(group edit?)
            const data = {
                id_list: this.groupCheckList
            }
            this.services.removeGroupData(data, () => {
                console.log("Succeed to remove group data ", data);
                this.groupCheckList = [];
            }, (error) => {
                console.log("Failed to remove group data");
            });
        },
        handleReserveRemove(list){
            const data = {
                id_list: list
            };
            this.services.removeReserveAlarm(data, () => {
                console.log("Succeed to remove reserve alarm");
                this._.forEach(list, id => {
                    this.$store.commit('removeReserveAlarmData', id);
                    this.reserveAlarmList = this._.without(this.reserveAlarmList, id);
                });
            }, (error) => {
                console.error("Failed to remove reserve alarm", error);
            });
            this.isTopPressedType = '';
        },
        handleRemoveGroupItem(idList) {
            this.$emit('select-remove', idList);
        },
        groupCheckListInit() {
            this.groupCheckList = [];
        }
    },
    computed: {
        isEmpty() {
            return this._.isEmpty(this.groupCheckList);
        },
        buttonText() {
            if (this.type === 'broadcast') {
                return this.isEmpty? 'SELECT YOUR GROUP': 'START BROADCAST';
            } else if (this.type === 'group' || this.type === 'sound') {
                return 'NEXT';
            }
        }
    },
    created() {
        if (this.type === 'sound') {
            this.groupList = this.$store.state.alarmList;
        } else {
            this.groupList = this.$store.state.groupList;
        }
        // if (!this._.isEmpty(this.groupList)) { //TODO: 이름순으로 정렬 가능
        //     this.groupList = _.sortBy(this.groupList, ['name']);
        // }
        console.log("Create filter list ", this.groupList)
    }
}
</script>
<style>
.group-container {
    position: absolute;
    width: 300px;
    height: auto;
    background-color: rgb(249, 249, 249);
    border: 1px solid rgb(223, 223, 233);
    z-index: 1;
    left: 50px;
    border-radius: 10px;
    z-index: 1;
    box-shadow: 0.25em 0.25em 0.75em rgba(0, 0, 0, .1);
    overflow: hidden;
}
.group-container.broadcast {
    left: 475px;
}
.group-container.group_set_up {
    left: 315px;
}
.group-frame {
    max-height: 350px;
    overflow-y: scroll;
}
.group-button-frame {
    width: 100%;
    height: 60px;
}
.group-button-panel {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
    background-color: rgb(85, 185, 250);
    color: white;
    cursor: pointer;
}
.group-button-panel.deactive {
    pointer-events: none;
    background-color: rgb(204, 204, 204);
    color: rgb(177, 177, 177);
}
.group-button-text {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    text-align: center;
    font-weight: bold;
    font-size: 15px;
}
.group-item-panel.add {
    padding: 10px 20px;
}
.group-add-frame {

}
.ga-left-frame {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 160px;
    height: 30px;
}
.ga-name-input {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
}
.ga-right-frame {
    position: absolute;
    top: 7.5px;
    right: 0;
    width: 110px;
}
.ga-button-panel {
    width: 30px;
    height: 30px;
    display: inline-flex;
    cursor: pointer;
}
.ga-button-panel {
    margin-left: 4px;
}
.ga-button {
    width: 100%;
    height: 100%;
    background-image: url('../../assets/imgs/icon-checked.svg');
    background-size: 75%;
    background-repeat: no-repeat;
    background-position: center center;
}
.ga-button.cancel {
    background-image: url('../../assets/imgs/icon-close(red).svg');
    background-size: 60%;
}
.ga-button.remove {
    background-image: url('../../assets/imgs/trash.svg');
    background-size: 60%;
}
.remain-container {
    position: relative;
    width: 100%;
    height: 50px;
}
.group-button-create-wrapper {
    width: 100%;
    height: 60px;
}
.group-button-create-panel {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
    background-color: rgb(85, 185, 250);
    color: white;
    cursor: pointer;
}
.group-create-button-text {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    text-align: center;
    font-weight: bold;
    font-size: 15px;
}
</style>