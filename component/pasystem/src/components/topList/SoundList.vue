<template>
    <div id='soundlist' class="sound-container">
        <div class="sound-frame">
            <div v-if="isEmpty" class="no-sound-panel">
                <div class="no-sound-text">THERE IS NO SOUND.</div>
                <div class="no-sound-image-panel">
                    <div class="no-sound-image"
                    @click="selectedAddSound"></div>
                </div>
                <div class="no-sound-text">PLEASE ADD A SOUND.</div>
            </div>
            <div v-else class="list-panel">
                <div class="list-wrapper">
                    <SoundItem v-for="id in list" :key="id"
                    :id="id" @select-checkbox="handleSelectCheckbox"></SoundItem>
                </div>
                <div class="sound-button-wrapper">
                    <div class="sound-button-panel" :class="{ deactive: !deactive }"
                    @click="selectedAddSound">
                        <div class="sound-button-text">UPLOAD</div>
                    </div>
                    <div class="sound-button-panel right" :class="{ deactive: deactive }"
                    @click="selectedRemove">
                        <div class="sound-button-text">REMOVE</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import SoundItem from '@/components/topList/SoundItem'
export default {
    name: 'SoundList',
    components: {
        SoundItem
    },
    props: {
        list: {
            type: Array
        }
    },
    data() {
        return {
            selectedList: []
        }
    },
    methods: {
        selectedAddSound() {
            this.$emit('select-add');        //TODO: alarm file을 올릴 수 있습니다.
        },
        selectedRemove() {
            this.$emit('select-remove', this.selectedList);
            this.selectedList = [];
        },
        handleSelectCheckbox(id) {
            if (!this._.includes(this.selectedList, id)) {
                this.selectedList.push(id);
            } else {
                this.selectedList = this._.without(this.selectedList, id);
            }
        }
    },
    computed: {
        isEmpty() {
            return this._.isEmpty(this.list);
        },
        deactive() {
            return this._.isEmpty(this.selectedList);
        }
    },
    created() {
    }
}
</script>
<style>
.sound-container {
    position: absolute;
    width: 300px;
    left: 135px;
    background-color: rgb(249, 249, 249);
    border: 1px solid rgb(223, 223, 233);
    border-radius: 10px;
    z-index: 1;
    overflow: hidden;
}
.sound-frame {
    width: 100%;
    height: 100%;
}
.no-sound-panel {
    padding: 20px;
}
.no-sound-text {
    font-weight: bold;
    text-align: center;
}
.no-sound-image-panel {
    height: 50px;
    margin: 30px;
}
.no-sound-image {
    position: absolute;
    width: 50px;
    height: 50px;
    left: 50%;
    transform: translateX(-50%);
    background-size: 100%;
    background-color: rgb(85, 185, 250);
    border-radius: 50px;
    background-image: url('../../assets/imgs/icon-add(active).svg');
    cursor: pointer;
}
.list-panel {
    width: 100%;
    height: 100%;
}
.list-wrapper {
    height: 180px;
    overflow-y: scroll;
}
.sound-button-wrapper {
    width: 100%;
    height: 60px;
}
.sound-button-panel {
    position: relative;
    display: inline-block;
    width: 50%;
    height: 100%;
    background-color: rgb(85, 185, 250);
    color: white;
    cursor: pointer;
}
.sound-button-panel.right {
    width: 50%;
    border-left: 2px solid rgb(81, 177, 237);
}
.sound-button-panel.deactive {
    pointer-events: none;
    background-color: rgb(204, 204, 204);
    color: rgb(177, 177, 177);
}
.sound-button-text {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    text-align: center;
    font-weight: bold;
    font-size: 15px;
}
</style>
