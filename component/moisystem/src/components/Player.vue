<template>
<div ref="playerContent" class="player-container">
    <video ref="videoPlayer" class="video-player" controls="controls" autoplay="autoplay"></video>
</div>
</template>

<script>
import Hls from 'hls.js'
import { EventBus } from '@/main.js';
export default {
    name: "Player",
    props: {
        id: {
            type: String,
            default: ''
        },
        size: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            options: {},
            url: '',
            ipcam: {},
            hls: null,
            src: ''
        }
    },
    mounted() {
        this.ipcam = this.$store.getters.getIpcam(this.id);
        this.$refs.videoPlayer.height = this.size.height;
        this.$refs.videoPlayer.width = this.size.width;
        this._playMedia(this.id);
    },
    computed: {
        hasStreamingURL() {
            return !this._.isEmpty(this.url);
        }
    },
    beforeDestroy() {
        this.hls.destroy();
    },
    watch: {
        size: function() {
            this.$refs.videoPlayer.height = this.size.height;
            this.$refs.videoPlayer.width = this.size.width;
        }
    },
    methods: {
        _playMedia(id) {
            this.hls = new Hls();
            this.hls.attachMedia(this.$refs.videoPlayer);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.$refs.videoPlayer.play();
            });
            this.url = this.$store.getters.getStreamingURL(id);
            this.hls.loadSource(this.url);
        }
    },
    created() {
        EventBus.$on('openStreamURL', (id) => {
            if (this.id === id && this.hls) {
                this._playMedia(id);
            }
        });
    }
}
</script>
<style>
.player-container {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>
