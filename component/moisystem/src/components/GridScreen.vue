<template>
    <div id="grid-screen" class="grid-main-container">
        <div class="grid-main-frame" ref="gridFrame" :class="gridRepeatFrame">
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
            screenSize: {},
            gridRepeatFrame: ''
        }
    },
    methods: {
        _calculateSize() {
            const width = this.$refs.gridFrame.clientWidth,
                  height = this.$refs.gridFrame.clientHeight,
                  listSize = this._.size(this.list),
                  columns = this._getColumSize(listSize),
                  rows = this._getRowSize(listSize);

            this.gridRepeatFrame = `repeat${ columns }`;
            this.screenSize = {
                width: width / columns,
                height: height / rows
            }
        },
        _getColumSize(listSize) {
            if (listSize < 2) {
                return 1;
            } else if (listSize < 5) {
                return 2;
            } else if (listSize < 10) {
                return 3;
            } else if (listSize < 16) {
                return 4;
            } else {
                return 5;
            }
        },
        _getRowSize(listSize) {
            if (listSize < 3) {
                return 1;
            } else if (listSize < 5) {
                return 2;
            } else if (listSize < 12) {
                return 3;
            } else {
                return 4;
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
.grid-main-frame.repeat3 {
    grid-template-columns: repeat(3, 1fr);
}
.grid-main-frame.repeat4 {
    grid-template-columns: repeat(4, 1fr);
}
.grid-main-frame.repeat5 {
    grid-template-columns: repeat(5, 1fr);
}
</style>
