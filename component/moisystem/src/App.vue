<template>
    <div id="app">
        <!-- <router-view v-if="isConnected"></router-view> -->
        <Main v-if="isConnected"></Main>
    </div>
</template>
<script>
import Main from '@/views/Main';
export default {
    name: 'app',
    components: {
        Main
    },
    data() {
        return {
            isConnected: false
        }
    },
    methods: {
        websocketConnect() {
            let url = window.location.hostname;
            if (window.CONSTANTS.IS_DEV) {
                url = '192.168.0.15';
            }
            this.services.websocketConnect(url, 5555, () => {
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
                }, window.CONSTANTS.INTERVAL.WEBSOCKET_CONNECTION);
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
        this.websocketConnect();
        this.startInterval();
    }
}
</script>
<style>
#app {
    position: absolute;
    width: 100%;
    height: calc(100% + 15px);
    top: -15px;
    left: 0;
    margin: 0;
    padding: 0;
}
</style>