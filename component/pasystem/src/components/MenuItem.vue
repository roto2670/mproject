<template>
    <div id=menuitem>
        <div class="menu-top-frame">
            <div class="text-wrapper">
                <div class="type-text">Speaker</div>
                <div class="name-text">{{ speaker.name }}</div>
            </div>
        </div>
        <div class="menu-bottom-frame">
            <div v-for="(type, index) in zoneType" :key="index"
            @click="handleSelectMenu(type)" class="menu-panel">
                <div class="menu-text">{{ `${ type } Zone` }}</div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'MenuItem',
    props: {
        speaker: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            zoneType: []
        }
    },
    methods: {
        handleSelectMenu(type) {
            const lowerType = type.toLowerCase();
            this.$emit('select-menu', lowerType);
        }
    },
    created() {
        if (this._.isEmpty(this.speaker.tags)) {
            this.zoneType = ['Set'];
        } else {
            this.zoneType = ['Change', 'Remove'];
        }
    },
}
</script>
<style>
.menu-top-frame {
    position: relative;
}
.text-wrapper {
    text-align: center;
    padding: 15px;
}
.type-text {
    font-size: 1em;
    font-weight: lighter;
}
.name-text {
    font-size: 1.3em;
    font-weight: bold;
    margin-top: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.menu-bottom-frame {
    max-height: 150px;
    overflow: scroll;
    position: relative;
    background-color: rgb(248, 144, 145);
}
.menu-panel {
    padding: 12px;
    border-top: thin solid rgb(250, 115, 120);
    cursor: pointer;
}
.menu-text {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
}
</style>
