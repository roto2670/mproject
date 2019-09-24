<template>
    <div id="reserveitem" class="sound-item-panel">
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
    name: 'ReserveItem',
    props: {
        type: {
            type: String
        },
        name: {
            type: String
        }
    },
    computed: {
        itemName() {
            const itemName = `Sound - ${ this.name }`
            if (this.type === window.CONSTANTS.RESERVE_TYPE.GROUP) {
                itemName = `Group - ${ this.name }`
            } else if (this.type === window.CONSTANTS.RESERVE_TYPE.GROUP) {
            }
            return itemName;
        }
    },
    methods: {
        handleSelectedCheckbox() {
            this.$emit('select-checkbox', this.type, this.name);
        }
    }
}
</script>