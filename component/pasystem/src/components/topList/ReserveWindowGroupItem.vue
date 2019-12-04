<template>
    <div class="reserve-group-item-panel">
        <div class="reserve-group-item-wrapper">
            <label class="reserve-group-item-label">
                <input type="checkbox" class="reserve-group-item-checkbox"
                v-model="checked"
                @change="handleSelectedCheckbox">
                <div class="reserve-group-item-text" :title="getItemName">{{ getItemName }}</div>
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
    },
    watch: {
    }
}
</script>
<style>
.reserve-group-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
    background-color: rgb(255, 255, 255)
}
.reserve-group-item-wrapper {
    transform: translateY(-10%);
}
.reserve-group-item-label {
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.reserve-group-item-checkbox {
    margin: -1px 10px 0 !important;
    width: 17px;
    height: 17px;
}
.reserve-group-item-text {
    display: inline-block;
    vertical-align: middle;
    width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
