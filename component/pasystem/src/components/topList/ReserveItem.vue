<template>
    <div id="reserveitem" class="r-sound-item-panel">
        <div class="r-sound-item-wrapper">
            <label class="r-sound-item-label">
                <input type="checkbox" class="r-sound-item-checkbox"
                @change="handleSelectedCheckbox">{{ itemName }}
            </label>
        </div>
    </div>
</template>
<script>
export default {
    name: 'ReserveItem',
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            reserve: {}
        }
    },
    computed: {
        itemName() {
            const itemName = `Reserve - ${ this.reserve.hour } : ${ this.reserve.minute }`
            if (this.type === window.CONSTANTS.RESERVE_TYPE.GROUP) {
                itemName = `Group - ${ this.hour }`
            } else if (this.type === window.CONSTANTS.RESERVE_TYPE.GROUP) {
            }
            return itemName;
        }
    },
    methods: {
        handleSelectedCheckbox() {
            this.$emit('select-checkbox', this.id);
        }
    },
    created() {
        this.reserve = this.$store.getters.getReserveAlarmData(this.id);
    }
}
</script>
<style>
.r-sound-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
}
.r-sound-item-wrapper {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}
.r-sound-item-label {
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.r-sound-item-checkbox {
    margin: -1px 10px 0 !important;
    width: 17px;
    height: 17px;
    vertical-align: middle;
}
</style>