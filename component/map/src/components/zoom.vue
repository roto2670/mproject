<template>
<div id="zoom" class="container">
    <button id="clickbtnPlus" @click="zoomIn">
    </button>
    <button id="clickbtnMinus" @click="zoomOut">
    </button>
</div>
</template>
<script>
import { EventBus } from "../main";
export default {
    name: 'Zoom',
    methods: {
        zoomIn() {
            EventBus.$emit('zoomIn');
        },
        zoomOut() {
            EventBus.$emit('zoomOut');
        }
    }
}
</script>

<style>
#btntitle {
    margin-block-start: 7px;
}

#zoom {
    width: 10%;
    position: absolute;
    z-index: 1;
}
#clickbtnPlus {
    border-radius: 50%;
    background-image: url('../../public/icon-plus.svg');
    cursor: pointer;
    height: 35px;
    width: 35px;
    background-color: rgb(85, 185, 250);
}

#clickbtnPlus:hover {
    border-radius: 15px;
    display: inline-block;
    box-shadow: 1px 1px 0.5px #aaaaaa;
    cursor: pointer;
}

#clickbtnMinus {
    margin-left: 10px;
    border-radius: 50%;
    background-image: url('../../public/icon-minus.svg');
    cursor: pointer;
    height: 35px;
    width: 35px;
    background-color: rgb(85, 185, 250);
}

#clickbtnMinus:hover {
    border-radius: 15px;
    display: inline-block;
    box-shadow: 1px 1px 0.5px #aaaaaa;
    cursor: pointer;
}
</style>
