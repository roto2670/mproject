<template>
    <div class="reserve-item-group-item-panel">
        <div class="reserve-item-group-item-wrapper">
            <label class="reserve-item-group-item-label">
                <div class="reserve-item-group-item-text">
                    {{ getItemName }}
                </div>
            </label>
        </div>
    </div>
</template>
<script>
import { EventBus } from '@/main.js';
export default {
    name: 'ReserveItemInfoItem',
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            group: {}
        }
    },
    computed: {
        getItemName() {
            return `${ this.group.name }`;
        }
    },
    methods: {
    },
    created() {
        this.group = this.$store.getters.getGroup(this.id);
    },
    watch: {
    }
}
</script>
<style>
.reserve-item-group-item-panel {
    position: relative;
    width: 100%;
    height: 45px;
    padding: 15px;
    border-bottom: 1px solid rgb(235, 235, 235);
}
.reserve-item-group-item-wrapper {
    transform: translateY(-15%);
}
.reserve-item-group-item-label {
    font-size: 20px;
    user-select: none;
    color: rgb(128, 128, 128);
    font-weight: bold;
}
.reserve-item-group-item-checkbox {
    margin: -1px 10px 0 !important;
    width: 17px;
    height: 17px;
    vertical-align: middle;
}
.reserve-item-group-item-text {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
