<template>
    <div class="left-group-item-panel">
        <div class="left-group-item-wrapper">
            <label class="left-group-item-label">
                <input type="checkbox" class="left-group-item-checkbox"
                v-model="checked" :disabled="disabled"
                @change="handleSelectedCheckbox">
                <div class="left-group-item-text" :title="getItemName">{{ getItemName }}</div>
            </label>
        </div>
    </div>
</template>
<script>
import { EventBus } from '@/main.js';
export default {
    name: 'GroupItem',
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            group: {},
            checked: false,
            disabled: false
        }
    },
    computed: {
        getItemName() {
            return `${ this.group.name }`;
        }
    },
    methods: {
        handleSelectedCheckbox() {
            this.$emit('select-checkbox', this.group.id, this.checked);
        },
    },
    created() {
        this.group = this.$store.getters.getGroup(this.id);
        EventBus.$on('g-close-infowindow', (v) => {
          this.disabled = false;
          this.checked = false;
        })
        EventBus.$on('g-open-infowindow', (v) => {
          this.disabled = true;
        })
        EventBus.$on('g-close-reserve-infowindow', (v) => {
            this.disabled = false;
            this.checked = false;
        })
        EventBus.$on('g-open-reserve-infowindow', (v) => {
            this.disabled = true;
        })
    },
    watch: {
    }
}
</script>
<style>
.left-group-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
}
.left-group-item-wrapper {
    transform: translateY(-10%);
}
.left-group-item-label {
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.left-group-item-checkbox {
    margin: -1px 10px 0 !important;
    width: 17px;
    height: 17px;
}
.left-group-item-text {
    display: inline-block;
    vertical-align: middle;
    width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
