<template>
    <div v-if="isImageButton" id="top-button" class="button-panel"
    :class="type" @click="handleSelectedButton">
        <div class="button-image" :class="classObj"></div>
    </div>
    <div v-else id="top-button" class="text-button-panel"
    :class="classObj" @click="handleSelectedButton">
        <div class="text-button-image-panel">
            <div class="text-button-image" :class="classObj"></div>
        </div>
        <div class="text-button-label" :class="{ pressed: pressed }">
            <div class="text-button" :class="{ pressed: pressed }">{{ buttonText }}</div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'TopButton',
    props: {
        type: {
            type: String,
            required: true
        },
        selectedType: {
            type: String
        }
    },
    methods: {
        handleSelectedButton() {
            this.$emit('select-button', this.type);
        }
    },
    computed: {
        isImageButton() {
            return this.type === window.CONSTANTS.TOP_BUTTON_TYPE.PLUS ||
                   this.type === window.CONSTANTS.TOP_BUTTON_TYPE.MINUS ||
                   this.type === window.CONSTANTS.TOP_BUTTON_TYPE.FILTER;
        },
        buttonText() {
            let text = '';
            if (this.type === window.CONSTANTS.TOP_BUTTON_TYPE.SOUND_SET_UP) {
                text = 'SOUND SET-UP';
            } else if (this.type === window.CONSTANTS.TOP_BUTTON_TYPE.BROADCAST) {
                text = 'BROADCAST';
            } else if (this.type === window.CONSTANTS.TOP_BUTTON_TYPE.GROUP_SET_UP) {
                text = 'GROUP SET-UP';
            } else if (this.type === window.CONSTANTS.TOP_BUTTON_TYPE.SCHEDULED_BROADCAST) {
                text = 'SCHEDULED BROADCAST';
            } else if (this.type === window.CONSTANTS.TOP_BUTTON_TYPE.RESERVE) {
                text = 'ALARM SET-UP';
            }
            return text;
        },
        pressed() {
            if (this.type === window.CONSTANTS.TOP_BUTTON_TYPE.PLUS ||
                this.type === window.CONSTANTS.TOP_BUTTON_TYPE.MINUS) {
                return false;
            } else {
                return this.selectedType === this.type;
            }
        },
        classObj() {
            const obj = {};
            obj[this.type] = true;
            obj[`${this.type}-pressed`] = this.pressed;
            return obj;
        }
    }
}
</script>
<style>
.button-panel {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 40px;
    margin: 7.5px;
    cursor: pointer;
}
.button-panel.filter {
    margin: 7.5px 25px;
}
.button-image {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: 105%;
    background-position: center center;
    background-repeat: no-repeat;
    background-color: rgb(85, 185, 250);
    box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);
    border-radius: 50%;
}
.button-image.plus {
    background-image: url('../assets/imgs/icon-plus.svg');
}
.button-image.minus {
    background-image: url('../assets/imgs/icon-minus.svg');
}
.button-image.filter {
    background-image: url('../assets/imgs/icon-filter.svg');
}
.button-image.plus:active {
    background-color: white;
    background-image: url('../assets/imgs/icon-plus(active).svg');
}
.button-image.minus:active {
    background-color: white;
    background-image: url('../assets/imgs/icon-minus(active).svg');
}
.button-image.filter-pressed {
    background-color: white;
    background-image: url('../assets/imgs/icon-filter(active).svg');
}
.text-button-panel {
    position: relative;
    display: inline-block;
    width: 150px;
    height: 40px;
    border-radius: 50px;
    background-color: white;
    margin: 7.5px;
    cursor: pointer;
    overflow: hidden;
    box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);
}
.text-button-panel.sound_set_up,
.text-button-panel.group_set_up {
    width: 160px;
}
.text-button-panel.broadcast {
    width: 145px;
}
.text-button-panel.sound_set_up-pressed,
.text-button-panel.group_set_up-pressed,
.text-button-panel.broadcast-pressed,
.text-button-panel.scheduled_broadcast-pressed,
.text-button-panel.reserve-pressed {
    background-color: rgb(85, 185, 250);
}
.text-button-image-panel {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50px;
}
.text-button-image {
    width: 100%;
    height: 100%;
    background-size: 120%;
    background-position: center center;
    background-repeat: no-repeat;
}
.text-button-image.sound_set_up {
    background-image: url('../assets/imgs/icon-sound.svg');
}
.text-button-image.group_set_up {
    background-image: url('../assets/imgs/icon-group.svg');
}
.text-button-image.broadcast {
    background-image: url('../assets/imgs/icon-broadcast.svg');
}
.text-button-image.sound_set_up-pressed {
    background-image: url('../assets/imgs/icon-sound(active).svg');
}
.text-button-image.group_set_up-pressed {
    background-image: url('../assets/imgs/icon-group(active).svg');
}
.text-button-image.broadcast-pressed {
    background-image: url('../assets/imgs/icon-broadcast(active).svg');
}
.text-button-image.reserve {
    background-size: 40%;
    background-image: url('../assets/imgs/clock.svg');
}
.text-button-label {
    position: absolute;
    width: 110px;
    height: 40px;
    background-color: white;
    left: 40px;
}
.text-button-label.pressed {
    background-color: rgb(85, 185, 250);
}
.text-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: rgb(12, 100, 158);
    font-weight: bold;
    user-select: none;
}
.text-button.pressed {
    color: white;
}
</style>
