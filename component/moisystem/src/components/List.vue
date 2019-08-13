<template>
    <div id="list" class="list-main-container">
        <div class="list-main-frame">
            <div class="list-top-frame">
                <div class="list-text">{{ title }}</div>
                <div @click="handleCloseButton" class="list-button">
                    <CloseIcon color="white"/>
                </div>
            </div>
            <div class="list-content-frame">
                <list-item v-for="ipcam in ipcams" :key="ipcam.id"
                :ipcam="ipcam" :checked="isSelected(ipcam.id)"
                :selectedIpcamId="selectedId"
                @select-item="handleSelectedItem"/>
            </div>
        </div>
    </div>
</template>
<script>
import ListItem from '@/components/ListItem'
import CloseIcon from '@/components/icons/CloseIcon'
export default {
    name: 'List',
    components: {
        ListItem,
        CloseIcon
    },
    props: {
        selectedList: {
            type: Array
        }
    },
    data() {
        return {
            ipcams: [],
            title: 'Selected videos',
            selectedId: ''
        }
    },
    methods: {
        handleSelectedItem(id) {
            this.$emit('select-item', id);
            this.selectedId = id;
        },
        handleCloseButton() {
            this.$emit('select-close-list');
        },
        isSelected(id) {
            return this._.includes(this.selectedList, id);
        }
    },
    created() {
        this.ipcams = this.$store.getters.getIpcams;
        console.log("Create list view ", this.ipcams);
    },
    watch: {
        selectedList: function() {
            this.selectedId = '';
        }
    }
}
</script>
<style>
.list-main-container {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
    background-color: rgba(0, 0, 0, 0.75)
}
.list-main-frame {
    width: 250px;
    height: 90%;
    position: absolute;
    top: 1em;
    left: 1em;
    border-radius: 15px;
    overflow: hidden;
}
.list-top-frame {
    position: relative;
    width: 100%;
    height: 3em;
    background-color: rgb(25, 195, 180);
}
.list-text {
    position: absolute;
    left: 1em;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-weight: bold;
    font-size: 1.1em;
    letter-spacing: .4px;
}
.list-button {
    position: absolute;
    width: .7em;
    height: .7em;
    top: 40%;
    transform: translateY(-50%);
    right: 1em;
}
.list-content-frame {
    position: relative;
    width: 100%;
    height: calc(100% - 2.5em);
    overflow-x: hidden;
    overflow-y: scroll;
    background: white;
}
</style>