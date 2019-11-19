<template>
    <div id="onAir" class="onair-container">
        <div v-if="getOnAir" class="onair-image"></div>
    </div>
</template>
<script>
export default {
    name: 'onAir',
    components: {
    },
    props: {
        isOnAir: {
            type: Boolean
        }
    },
    data() {
        return {
        }
    },
    computed: {
        getOnAir() {
            return this.isOnAir;
        }
    },
    methods: {
    },
    created() {
    }
}
</script>
<style>
.onair-container {
    position:absolute;
    left: 90%;
    top: 10%;
    z-index: 5;
}
.onair-image {
    width: 70px;
    height: 70px;
    background-size: 100%;
    background-image: url('../assets/imgs/on-air.svg');
    background-position: center center;
    background-repeat: no-repeat;
}
</style>