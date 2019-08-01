<template>
    <div id="sound-item" class="sound-item-panel">
        <div class="sound-item-wrapper">
            <label class="sound-item-label">
                <input type="checkbox" class="sound-item-checkbox"
                @change="handleSelectedCheckbox">{{ itemName }}
            </label>
        </div>
    </div>
</template>
<script>
export default {
    name: 'SoundItem',
    props: {
        id: {
            type: Number
        }
    },
    data() {
        return {
            alarm: {}
        }
    },
    computed: {
        itemName() {
            return `Sound - ${ this.alarm.name }`;
        }
    },
    methods: {
        handleSelectedCheckbox() {
            this.$emit('select-checkbox', this.id);
        }
    },
    created() {
        this.alarm = this.$store.getters.getAlarmData(this.id);
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
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}
.sound-item-label {
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
</style>