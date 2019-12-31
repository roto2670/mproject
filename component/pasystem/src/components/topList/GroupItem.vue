<template>
    <div v-if="isShowing" class="group-item-panel">
        <div v-if="!isEdit" class="group-item-wrapper">
            <label class="group-item-label">
                <input type="checkbox" class="group-item-checkbox"
                v-model="checked"
                @change="handleSelectedCheckbox">
                <div class="group-item-text" :title="getItemName">{{ this.item.name }}</div>
            </label>
        </div>
        <div v-if="isShowingEditButton" class="group-grouping-button"
        @click="handleGroupingButton">
            <div class="group-grouping-image"></div>
        </div>
        <div v-if="isShowingEditButton" class="group-edit-button"
        @click="handleEditButton">
            <div class="group-edit-image"></div>
        </div>
    </div>
    <div v-else-if="isEdit" class="group-item-panel add">
        <div class="group-add-frame">
            <div class="ga-left-frame">
                <input type="text" class="ga-name-input" v-model="name" maxlength="30" />
            </div>
            <div class="ga-right-frame">
                <div class="ga-button-panel" @click="handleRemoveGroup">
                    <div class="ga-button remove"></div>
                </div>
                <div class="ga-button-panel" @click="handleEditGroup">
                    <div class="ga-button"></div>
                </div>
                <div class="ga-button-panel cancel" @click="handleEditCancel">
                    <div class="ga-button cancel"></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { EventBus } from '@/main.js';
export default {
    name: 'GroupItem',
    props: {
        item: {
            type: Object
        },
        type: {
            type: String
        },
        filterList: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            checked: false,
            isEdit: false,
            name: ''
        }
    },
    computed: {
        getItemName() {
            if (this.item < 0) {
                return 'All Group';
            } else if (this.type === 'sound') {
                return `Sound - ${ this.item.name }`;
            }
            return `Group - ${ this.item.name }`;
        },
        isShowing() {
            return this.item.name !== 'none' && !this.isEdit;
        },
        isShowingEditButton() {
            return this.type === window.CONSTANTS.TOP_BUTTON_TYPE.GROUP_SET_UP && !this.isEdit;
        }
    },
    methods: {
        handleSelectedCheckbox() {
            this.$emit('select-checkbox', this.item.id, this.checked);
        },
        setCheckBox() {
            if (this.type === window.CONSTANTS.TOP_BUTTON_TYPE.FILTER) {
                this.checked = !this._.includes(this.filterList, this.item.id);
            } else {
                this.checked = false;
            }
        },
        handleEditButton() {
            this.isEdit = true;
        },
        handleGroupingButton() {
            EventBus.$emit('g-grouping-fire', this.item);
        },
        handleRemoveGroup() {
            const data = {
                id_list: [this.item.id]
            }
            this.$emit('handle-remove', data);
        },
        handleEditGroup() {
            if (this.name !== this.item.name) {
                const data = {
                    id: this.item.id,
                    name: this.name
                };
                this.services.changeGroupName(data, () => {
                    console.log("Succeed to update group name ", this.name);
                    this.isEdit = false;
                }, (error) => {
                    console.log("Failed to update group name ", error);
                    this.isEdit = false;
                });
            }
        },
        handleEditCancel() {
            this.isEdit = false;
        }
    },
    created() {
        this.setCheckBox();
        this.name = this.item.name;
    },
    watch: {
        type: function() {
            this.setCheckBox();
        },
        filterList: function() {
            if (this.type === 'sound') {
                this.checked = this._.includes(this.filterList, this.item.id);
            }
        }
    }
}
</script>
<style>
.group-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
}
.group-item-wrapper {
    transform: translateY(-25%);
}
.group-item-label {
    width: 100%;
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.group-item-checkbox {
    margin: -1px 10px 0 !important;
    width: 17px;
    height: 17px;
    vertical-align: middle;
}
.group-item-text {
    display: inline-block;
    width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
}
.group-edit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0px;
    width: 40px;
    height: 40px;
    cursor: pointer;
}
.group-edit-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/icon-modify.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
.group-grouping-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 35px;
    width: 20px;
    height: 20px;
    cursor: pointer;
}
.group-grouping-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/grouping.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
</style>
