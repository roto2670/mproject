<template>
<div id="locationTracking">
  <div v-show="isLoaded" class="loading"><div class="main-loader"><div></div><div></div><div></div><div></div></div></div>
  <Top v-if="isWebsocketConnected" :info="info" :isConnected="isConnected"></Top>
  <Map v-if="isWebsocketConnected" :info="info" :isConnected="isConnected" @map-load="handleMapLoad"></Map>
</div>
</template>
<script>
import Map from '@/components/map';
import Top from '@/components/top';
import services from '@/services/services';
export default {
    components: {
        Map,
        Top
    },
    data() {
        return {
            isLoaded: false,
            isWebsocketConnected: false,
            info: {},
            isConnected: false,
            checkInterval: null
        }
    },
    methods: {
        handleMapLoad(isLoaded) {
            this.isLoaded = isLoaded;
        },
        websocketConnect() {
            let url = window.location.hostname;
            if (window.CONSTANTS.IS_DEV) {
                // url = '192.168.0.13';
                // url = '127.0.0.1';
                // url = '192.168.1.136'
                url = '192.168.0.15'
            }
            this.services.websocketConnect(url, 5555, () => {
                this.isWebsocketConnected = true;
                console.log("Connect");
                this.isConnected = true;
                this.stopInterval();
            }, () => {
                console.log("Disconnect");
                this.isConnected = false;
                this.startInterval();
            }, () => {
                console.log("Error");
            })
        },
        startInterval() {
        if (!!!this.checkInterval) {
            this.checkInterval = setInterval(() => {
                this.websocketConnect();
            }, 10000);
        }
        },
        stopInterval() {
        if (!!this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        this.checkInterval = null;
        }
    },
    created() {
        this.services.getInfo(info => {
        if (this._.isObject(info)) {
            this.info = info;
            //start
            this.websocketConnect();
            this.startInterval();
        }
        });
    }
}
</script>
<style>
#locationTracking {
    height: 100%;
    width: 100%;
    /*------------ This CSS are required when npm run build -----------*/
    position: relative;
}

.loading {
    width: 100%;
    position: fixed;
    background-color: white;
    height: 105%;
    z-index: 3;
    opacity: 0.7;
    /*------------ This CSS are required when npm run build -----------*/
    position: relative;
}

.main-loader {
    display: inline-block;
    position: absolute;
    width: 100px;
    height: 100px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    opacity: 1;
    z-index: 4;
}
.main-loader div {
    position: absolute;
    top: 27px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: black;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.main-loader div:nth-child(1) {
    left: 6px;
    animation: loader1 0.6s infinite;
}
.main-loader div:nth-child(2) {
    left: 6px;
    animation: loader2 0.6s infinite;
}
.main-loader div:nth-child(3) {
    left: 26px;
    animation: loader2 0.6s infinite;
}
.main-loader div:nth-child(4) {
    left: 45px;
    animation: loader3 0.6s infinite;
}
@keyframes main-loader1 {
    0% {
        transform: scale(0);
    }
    100% {
        transform: scale(1);
    }
}
@keyframes main-loader3 {
    0% {
        transform: scale(1);
    }
    100% {
        transform: scale(0);
    }
}
@keyframes main-loader2 {
    0% {
        transform: translate(0, 0);
    }
    100% {
        transform: translate(19px, 0);
    }
}


@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
