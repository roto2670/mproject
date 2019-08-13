<template>
    <div v-if="isCheckMoi" id="list-item" class="list-item-container"
    :class="{ checked: checked }" @click="handleSelectedItem">
        <div class="list-item-frame">
            <div class="list-item-checkbox">
                <loading-icon v-if="isShowingLoading"/>
                <check-icon v-else :selected="checked"/>
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
import LoadingIcon from '@/components/icons/LoadingIcon';
export default {
    name: 'ListItem',
    components: {
        CheckIcon,
        LoadingIcon
    },
    props: {
        ipcam: {
            type: Object
        },
        checked: {
            type: Boolean
        },
        selectedIpcamId: {
            type: String
        }
    },
    methods: {
        handleSelectedItem() {
            if (!!!this.selectedIpcamId) {
                this.$emit('select-item', this.ipcam.id);
            }
        }
    },
    computed: {
        isCheckMoi() {
            return !!this.ipcam.custom && this.ipcam.custom.is_visible_moi;
            // return true;
        },
        isShowingLoading() {
           return this.selectedIpcamId === this.ipcam.id;
        }
    },
    created() {
        // console.log("Create list item ", this.ipcam);
    }
}
</script>
<style>
.list-item-container {
    position: relative;
    width: 100%;
    height: 3em;
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
    position: absolute;
    transform: translateY(-50%);
    top: 50%;
    cursor: pointer;
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
    font-size: 1.3em;
    font-weight: 700;
    color: black;
    position: absolute;
    cursor: pointer;
    transform: translateY(-50%);
    top: 50%;
    left: 15%;
}
.list-item-name-text.checked {
    color: rgb(0, 0, 0, 0.5);
}

</style>