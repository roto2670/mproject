<template>
    <div id="button" class="button-container" :class="{ selected: isSelected }"
    @click="handleSelectButton">
        <div class="button-icon-panel">
            <ListIcon v-show="type === 0" :isSelected="isSelected"></ListIcon>
            <MenuIcon v-show="type === 1" :isSelected="isSelected"></MenuIcon>
        </div>
    </div>
</template>
<script>
import ListIcon from '@/components/icons/ListIcon';
import MenuIcon from '@/components/icons/MenuIcon';
export default {
    name: 'Button',
    components: {
        ListIcon,
        MenuIcon
    },
    props: {
        type: {
            type: Number
        },
        isSelected: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            iconColor: 'default'
        }
    },
    methods: {
        handleSelectButton() {
            this.$emit('select-button', this.type);
        }
    },
    created() {
        console.log("Created button ", this.type);
    }
}
</script>
<style>
.button-container {
    width: 2.6em;
    height: 2.6em;
    border-radius: 10px;
    background-color: white;
    position: relative;
    display: inline-block;
    margin-top: .7em;
    margin-left: 1.8em;
}
.button-container + .button-container {
    margin-left: .7em;
}
.button-icon-panel {
    position: absolute;
    width: 1.1em;
    height: 1.1em;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.selected {
    background-color: rgb(25, 195, 180);
}
</style>
