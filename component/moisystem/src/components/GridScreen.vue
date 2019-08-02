<template>
    <div id="grid-screen" class="grid-main-container">
        <div class="grid-main-frame" ref="gridFrame">
            <div v-for="id in list" :key="id">
                <Player v-if="isMounted" :id="id" :size="screenSize"></Player>
            </div>
        </div>
    </div>
</template>
<script>
import Player from '@/components/Player'
export default {
    name: 'GridScreen',
    components: {
        Player
    },
    props: {
        list: {
            type: Array
        }
    },
    data() {
        return {
            screenSize: {}
        }
    },
    methods: {
        _calculateSize() {
            const width = this.$refs.gridFrame.clientWidth,
                  height = this.$refs.gridFrame.clientHeight,
                  listSize = this._.size(this.list),
                  columns = listSize > 1? 2: 1,
                  rows = Math.floor(listSize / 2) + listSize % 2;
            this.screenSize = {
                width: width / columns,
                height: height / rows
            }
        }
    },
    computed: {
        isMounted() {
            return !this._.isEmpty(this.screenSize);
        }
    },
    created() {
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this._calculateSize();
            }, 1);
        });
    },
    watch: {
        list: function() {
            this._calculateSize();
        }
    }
}
</script>
<style>
.grid-main-container {
    width: 100%;
    height: 100%;
}
.grid-main-frame {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}
</style>
