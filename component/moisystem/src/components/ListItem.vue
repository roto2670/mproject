<template>
    <div v-if="isCheckMoi" id="list-item" class="list-item-container"
    :class="{ checked: checked }" @click="handleSelectedItem">
        <div class="list-item-frame">
            <div class="list-item-checkbox">
                <check-icon :selected="checked"/>
            </div>
            <div class="list-item-name-panel">
                <div class="list-item-name-text"
                :class="{ checked: checked }">{{ ipcam.name }}</div>
            </div>
        </div>
    </div>
</template>
<script>
import CheckIcon from '@/components/icons/CheckIcon';
export default {
    name: 'ListItem',
    components: {
        CheckIcon
    },
    props: {
        ipcam: {
            type: Object
        },
        checked: {
            type: Boolean
        }
    },
    methods: {
        handleSelectedItem() {
            this.$emit('select-item', this.ipcam.id);
        }
    },
    computed: {
        isCheckMoi() {
            return !!this.ipcam.custom && this.ipcam.custom.is_visible_moi;
        }
    },
    created() {
        console.log("Create list item ", this.ipcam);
    }
}
</script>
<style>
.list-item-container {
    position: relative;
    width: 100%;
    height: 2.5em;
    padding: 0 5% 0 5%;
    border-bottom: thin solid rgba(0, 0, 0, 0.1);
}
.list-item-container:hover {
    background-color: rgb(250, 250, 250);
}
.list-item-container.checked {
    background-color: rgb(245, 245, 245);
}
.list-item-frame {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
}
.list-item-checkbox {
    width: 1em;
    height: 1em;
    display: inline-block;
    vertical-align: top;
}
.list-item-name-panel {
    width: calc(90% - 2em);
    display: inline-block;
    margin-left: 5%;
}
.list-item-name-text {
    white-space: nowrap;
    letter-spacing: .5px;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: .9em;
    color: black;
}
.list-item-name-text.checked {
    color: rgb(0, 0, 0, 0.5);
}
</style>