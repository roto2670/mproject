<template>
    <div v-if="isGrouping" id="grouping" class="grouping-container">
        <div class="grouping-top-container">
            <div class="grouping-title-container">
                {{ this.groupName }}
            </div>
        </div>
        <div class="grouping-bottom-container">
            <div class="grouping-button-container">
                <div class="grouping-ok-button" @click="handleOkButton">OK</div>
                <div class="grouping-cancel-button" @click="handleCancelButton">CANCLE</div>
            </div>
        </div>
    </div>
</template>
<script>
import { EventBus } from '@/main.js';
export default {
    name: 'grouping',
    components: {
    },
    props: {
    },
    data() {
        return {
            isGrouping: false,
            groupName: '',
            groupInfo: null
        }
    },
    computed: {
    },
    methods: {
        handleOkButton() {
            EventBus.$emit('g-grouping-finish', true, this.groupInfo);
            this.isGrouping = false;
        },
        handleCancelButton() {
            EventBus.$emit('g-grouping-finish', false, this.groupInfo);
            this.isGrouping = false;
        }
    },
    created() {
        EventBus.$on('g-grouping-fire', (v) => {
            this.isGrouping = true;
            this.groupName = v.name;
            this.groupInfo = v;
        })
    }
}
</script>
<style>
.grouping-container {
    position: absolute;
    right: 10px;
    top: 10%;
    z-index: 6;
    width: 200px;
    height: 100px;
    border-radius: 10px;
    background-color: rgb(210, 235, 250);
}
.grouping-top-container {
    width: 200px;
    height: 60px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}
.grouping-title-container {
    width: 200px;
    height: 50px;
    text-align: center;
    color: rgb(128, 128, 128);
    font-weight: bold;
    padding-top: 15px;
    padding-left: 10px;
    padding-right: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.grouping-bottom-container {
    width: 200px;
    height: 40px;
}
.grouping-button-container {
    text-align: center;
    padding-top: 6px;
    border-top: 1px solid rgb(208, 208, 208);
}
.grouping-ok-button {
    display: inline-block;
    background: white;
    border-radius: 4px;
    padding: 4px;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}
.grouping-cancel-button {
    display: inline-block;
    background: white;
    border-radius: 4px;
    padding: 4px;
    margin-left: 4px;
    color: rgb(128, 128, 128);
    font-weight: bold;
    cursor: pointer;
}

</style>