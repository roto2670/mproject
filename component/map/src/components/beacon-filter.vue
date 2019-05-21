<template>
<div id="filter" class="container">
    <button id="clickbtnFilter" @click="filter">
    </button>
</div>
</template>
<script>
import { EventBus } from "../main";

export default {
    name: 'BeaconFilter',
    methods: {
        filter() {
            EventBus.$emit('filter');
        },
    }
}
</script>

<style>
#filter {
    width: 10%;
    position: absolute;
    z-index: 1;
    margin-left: 8%;
}

#clickbtnFilter {
    border-radius: 50%;
    cursor: pointer;
    height: 35px;
    width: 35px;
    background-image: url('../../public/icon-alert.svg');
}

#clickbtnFilter:hover {
    box-shadow: 2px 2px 0.5px #aaaaaa;
}
</style>