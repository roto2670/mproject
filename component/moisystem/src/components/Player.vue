<template>
<div ref="playerContent" class="player-container">
    <div v-if="hasStreamingURL" class="player-info-container">
        <div class="player-info-name">{{ ipcam.name }}</div>
    </div>
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
.player-info-container {
    position: absolute;
    width: 100%;
    height: 3em;
    z-index: 1;
    background-color: rgba(130, 130, 130, 0.3);
}
.player-info-name {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 2em;
    color: white;
    font-size: .8em;
    letter-spacing: .7px;
}
</style>
