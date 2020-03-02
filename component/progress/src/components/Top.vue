<template>
    <div id="top" class="top-container">
        <div class="button-frame">
            <TopButton v-for="type in types" :key="type"
            :selectedType="selectedType" :type="type" @select-button="handleSelectedButton">
            </TopButton>
        </div>
    </div>
</template>
<script>
import TopButton from '@/components/TopButton';
export default {
    name: 'top',
    components: {
        TopButton
    },
    props: {
        selectedType: {
            type: String
        }
    },
    data() {
        return {
            types: window.CONSTANTS.TOP_BUTTON_TYPE
        }
    },
    methods: {
        handleSelectedButton(type) {
            this.$emit('select-top-button', type);
        }
    }
}
</script>
<style>
.top-container {
    width: 100%;
    height: 55px;
}
.button-frame {
    width: 100%;
    height: 100%;
    background-color: rgb(210, 235, 250);
}
</style>