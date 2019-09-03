<template>
    <div id="totalBeacon" class="totalBeacon">
        <div v-for="(data, hid) in hubs" :key="hid"
        class="cntItem">
            <div class="total-beacon-number"></div>
            <div class="total-beacon-list" :class="{ hubSelected: data }"
            @click="handleSelectedHubItem(data)"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BcnCountArea',
    props: {
        hubs: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            contextItem: null
        }
    },
    methods: {

    },
    computed: { 
        created() {
            console.log("hub list", this.hubs);
        }
    }
}
</script>
<style>
.totalBeacon{
    position: absolute;
    width: 300px;
    height: 200px;
}
.cntItem {
    background-color: red;
}
</style>