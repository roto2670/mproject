<template>
    <div id="contextmenu" class="menu-container" ref="container" :style="styleOption">
        <MenuItem v-if="isShowing" :speaker="speaker"
        @select-menu="handleSelectMenu"></MenuItem>
        <ZoneItem v-if="!isShowing"
        :speaker="speaker" :type="selectedType"
        @select-group="handleSelectGroup"></ZoneItem>
    </div>
</template>
<script>
import MenuItem from '@/components/MenuItem';
import ZoneItem from '@/components/ZoneItem';
export default {
    name: 'ContextMenu',
    components: {
        MenuItem,
        ZoneItem
    },
    props: {
        speaker: {
            type: Object,
            required: true
        },
        position: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            selectedType: '',
            top: 0,
            left: 0
        }
    },
    methods: {
        handleSelectMenu(type) {
            const _type = type.toLowerCase();
            if (_type !== window.CONSTANTS.CONTEXT_MENU_TYPE.REMOVE) {
                this.selectedType = _type;
                this.$nextTick(() => {
                    this.setContextMenuPosition();
                });
            } else {
                this.$emit('select-edit', _type);
            }
        },
        handleSelectGroup(group) {
            if (!!this.selectedType) {
                this.$emit('select-edit', this.selectedType, group.id);
            }
        },
        setContextMenuPosition() {
            const container = this.$refs.container;
            if (!!container) {
                const width = container.clientWidth,
                      height = container.clientHeight;
                this.top = Math.round(this.position.y - height + 40);
                this.left = Math.round(this.position.x - (width / 2));
            }
        }
    },
    computed: {
        isShowing() {
            return !!!this.selectedType;
        },
        styleOption() {
            return {
                top: `${ this.top }px`,
                left: `${ this.left }px`
            }
        }
    },
    mounted() {
        this.setContextMenuPosition();
    },
    watch: {
        position: function() {
            this.setContextMenuPosition();
        }
    }
}
</script>
<style>
.menu-container {
    position: absolute;
    min-width: 180px;
    max-width: 230px;
    height: auto;
    z-index: 2;
    border-radius: 15px;
    color: white;
    background-color: rgb(250, 115, 120);
    overflow: hidden;
    box-shadow: 10px 10px 25px rgba(40, 40, 40, 0.3);
}
</style>