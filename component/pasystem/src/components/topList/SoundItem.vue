<template>
    <div v-if="isEditMode" id="sound-item" class="sound-item-panel add">
        <div class="sound-add-frame">
            <div class="sa-left-frame">
                <label class="sound-item-label">
                    <div class="sound-item-edit-text" :title="itemName">{{ itemName }}</div>
                </label>
            </div>
            <div class="sa-right-frame">
                <div class="sa-button-panel" @click="handleSoundItemRemove">
                    <div class="sa-button"></div>
                </div>
                <div class="sa-button-panel cancel" @click="handleCancel">
                    <div class="sa-button cancel"></div>
                </div>
            </div>
        </div>
    </div>
    <div v-else id="sound-item" class="sound-item-panel">
        <div class="sound-item-wrapper">
            <label class="sound-item-label">
                <input type="checkbox" class="sound-item-checkbox"
                v-model="checked"
                @change="handleSelectedCheckbox">
                <div class="sound-item-text" :title="itemName">{{ itemName }}</div>
            </label>
        </div>
        <div v-if="isShowingEditButton" class="sound-edit-button"
        @click="handleEditButton">
            <div class="sound-edit-image"></div>
        </div>
    </div>
</template>
<script>
import { EventBus } from '@/main.js';
export default {
    name: 'SoundItem',
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            alarm: {},
            checked: false,
            isEdit: false
        }
    },
    computed: {
        itemName() {
            return `${ this.alarm.name }`;
        },
        isShowingEditButton() {
            return !this.isEdit;
        },
        isEditMode() {
            return this.isEdit;
        },
    },
    methods: {
        handleSelectedCheckbox() {
            this.$emit('select-checkbox', this.id);
        },
        handleEditButton() {
            this.isEdit = true;
        },
        handleSoundItemRemove() {
            this.isEdit = false;
            const data = [this.id];
            this.$emit('select-remove', data);
        },
        handleCancel() {
            this.isEdit = false;
        },
    },
    created() {
        this.alarm = this.$store.getters.getAlarmData(this.id);
        EventBus.$on('g-sound-playlist-finish', (v) => {
            this.checked = false;
        })
    }
}
</script>
<style>
.sound-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
}
.sound-item-wrapper {
    transform: translateY(-25%);
}
.sound-item-label {
    width: 100%;
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.sound-item-checkbox {
    margin: -1px 10px 0 !important;
    width: 17px;
    height: 17px;
    vertical-align: middle;
}
.sound-item-text {
    display: inline-block;
    width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
}
.sound-edit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    width: 40px;
    height: 40px;
    cursor: pointer;
}
.sound-edit-image {
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-image: url('../../assets/imgs/icon-modify.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
.sound-item-edit-text {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
}

.sound-item-panel.add {
    padding: 10px 20px;
}
.sound-add-frame {

}
.sa-left-frame {
    position: absolute;
    top: 26px;
    transform: translateY(-65%);
    width: 190px;
    height: 30px;
}
.sa-name-input {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
}
.sa-right-frame {
    position: absolute;
    top: 7.5px;
    right: 0;
    width: 70px;
}
.sa-button-panel {
    width: 30px;
    height: 30px;
    display: inline-flex;
    cursor: pointer;
}
.sa-button-panel {
    margin-left: 4px;
}
.sa-button {
    width: 100%;
    height: 100%;
    background-image: url('../../assets/imgs/trash.svg');
    background-size: 75%;
    background-repeat: no-repeat;
    background-position: center center;
}
.sa-button.cancel {
    background-image: url('../../assets/imgs/icon-close(red).svg');
    background-size: 60%;
}

</style>