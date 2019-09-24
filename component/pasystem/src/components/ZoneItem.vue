<template>
    <div id=menuitem>
        <div class="menu-top-frame">
            <div class="text-wrapper">
                <div class="type-text">{{ speaker.name }}</div>
                <div class="name-text">{{ type.toUpperCase() }}</div>
            </div>
        </div>
        <div class="menu-bottom-frame">
            <div v-for="(item, index) in groupList" :key="index"
            @click="handleSelectGroup(item)" class="menu-panel">
                <div class="menu-text">{{ item.name }}</div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'ZoneItem',
    props: {
        speaker: {
            type: Object,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            groupList: []
        }
    },
    methods: {
        handleSelectGroup(item) {
            this.$emit('select-group', item);
        }
    },
    created() {
        this.groupList = this.$store.getters.getGroupList;
        if (this.type === window.CONSTANTS.CONTEXT_MENU_TYPE.CHANGE) {
            const tag = this._.first(this.speaker.tags);
            this.groupList = this._.without(this.groupList, tag);
            this.groupList.sort();
        }
    },
}
</script>
