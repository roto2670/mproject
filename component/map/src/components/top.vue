<template>
    <div id="topContainer">
        <div id="leftContainer">
            <div id="zoom">
                <img id="clickbtnPlus" src="static/location/imgs/icon-plus.svg" @click="zoomIn">
                <img id="clickbtnMinus" src="static/location/imgs/icon-minus.svg" @click="zoomOut">
            </div>
            <div v-if="isShowingByStage(1)" id="filter">
                <img id="clickbtnFilter" src="static/location/imgs/icon-filter.svg" @click="filter">
            </div>
            <div v-if="isShowingByStage(0)" id="top-remove">
                <div id="removebtn" @click="remove"></div>
            </div>
        </div>
        <div v-if="isShowingByStage(0)" id="rightContainer">
            <div id="upload">
                <button id="clickbtn" @click="$refs.file.click()">
                                <div id="btntitle">Upload <i class="fa fa-upload"></i></div>
                            </button>
                <input type="file" id="file" ref="file" @change="onFileChange" accept="image/jpeg, image/png, image/gif" />
            </div>
        </div>
    </div>
</template>

<script>
    import {
        EventBus
    } from "../main";
    export default {
        name: 'Top',
        props: {
            info: {
                type: Object,
                default: {}
            },
            isConnected: {
                type: Boolean,
                required: true
            }
        },
        methods: {
            zoomIn() {
                EventBus.$emit('zoomIn');
            },
            zoomOut() {
                EventBus.$emit('zoomOut');
            },
            onFileChange(e) {
                this.file = e.target.files[0];
                this.submitFile();
            },
            getMapFile(successCallback) {
                this.services.getMapFile;
            },
            remove() {
                EventBus.$emit('removeItem');
            },
            submitFile() {
                this.services.postMapFile(this.file, (url) => {
                    // let baseLayer = new maptalks.ImageLayer("base", [{
                    //         url: url,
                    //         extent: [0, 0, 180, 85],
                    //         opactiy: 1
                    //     }], {
                    //         opactiy: 1
                    //     })
                    // this.map.removeBaseLayer();
                    // this.map.setBaseLayer(baseLayer);
                    window.location.reload();
                }, (err) => {
                    console.warn(`File upload failed`);
                });
            },
            handleFileUpload() {
                this.file = this.$refs.file.files[0];
            },
            filter() {
                EventBus.$emit('filter');
            },
            isShowingByStage(stage) {
                return this.info.stage <= stage;
            }
        },
        computed: {
            isEmptyUrl() {
                return !!!this.url;
            }
        },
        created() {
            this.getMapFile();
        }
    }
</script>

<style>
    #topContainer {
        width: 100%;
        margin-bottom: 10px;
    }
    
    #leftContainer {
        width: 50%;
        display: inline-block;
    }
    
    #rightContainer {
        width: 50%;
        text-align: right;
        display: inline-block;
        position: absolute;
    }
    
    /*  Zoom */
    
    #zoom {
        display: inline-block;
    }
    
    #clickbtnPlus {
        margin: 0 5px;
        border-radius: 100%;
        cursor: pointer;
        height: 2vw;
        width: 2vw;
        min-width: 20px;
        min-height: 20px;
        border: 1px solid rgb(85, 185, 250);
        background-color: rgb(85, 185, 250);
    }
    
    #clickbtnMinus {
        margin: 0 5px;
        border-radius: 100%;
        cursor: pointer;
        height: 2vw;
        width: 2vw;
        min-width: 20px;
        min-height: 20px;
        border: 1px solid rgb(85, 185, 250);
        background-color: rgb(85, 185, 250);
    }
    
    #removebtn {
        margin: 0 5px;
        border-radius: 100%;
        cursor: pointer;
        height: 2vw;
        width: 2vw;
        min-width: 20px;
        min-height: 20px;
        border: 1px solid rgb(85, 185, 250);
        background-size: 40%;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url('../../public/static/location/imgs/garbage.svg');
    }
    
    
    /*  Upload Button */
    
    input[type='file'] {
        display: none;
    }
    
    #clickbtn {
        display: inline-block;
        font-size: 1vw;
        font-weight: 600;
        border-radius: 15px;
        cursor: pointer;
        height: 2vw;
        width: 6vw;
        min-width: 80px;
        min-height: 25px;
        border: 1px solid rgb(85, 185, 250);
        color: rgb(85, 185, 250)
    }
    
    
    /*  Beacon Filter */
    
    #filter {
        display: inline-block;
    }
    
    #top-remove {
        display: inline-block;
        position: absolute;
    }
    
    #clickbtnFilter {
        border-radius: 100%;
        cursor: pointer;
        height: 2vw;
        width: 2vw;
        min-width: 20px;
        min-height: 20px;
        margin: 0 5px;
        border: 1px solid rgb(85, 185, 250);
        background-color: rgb(85, 185, 250);
    }
</style>
