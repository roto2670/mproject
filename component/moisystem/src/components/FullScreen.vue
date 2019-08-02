<template>
    <div id="full-screen">
        <Player :src="ipcam.src"/>
    </div>
</template>
<script>
import Player from '@/components/Player';
import { match } from 'minimatch';
export default {
    name: 'FullScreen',
    components: {
        Player
    },
    props: {
        ipcam: {
            type: Object,
            default: {}
        }
    }
}
</script>