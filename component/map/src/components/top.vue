<template>
    <div id="topContainer">
        <div id="leftContainer">
            <div id="zoom">
                <div class="clickbtn" title="Zoom In">
                <img id="clickbtnPlus" src="static/location/imgs/icon-plus.svg" @click="zoomIn" style="vertical-align:unset;">
                </div>
                <div class="clickbtn" title="Zoom Out">
                    <img id="clickbtnMinus" src="static/location/imgs/icon-minus.svg" @click="zoomOut" style="vertical-align:unset;">
                </div>
            </div>
            <div v-if="isShowingByStage(1)" id="filter" class="clickbtn" title="Filter Beacons">
                <img id="clickbtnFilter" src="static/location/imgs/icon-filter.svg" @click="filter" style="vertical-align:unset;">
            </div>
            <!-- TODO: Remove all comment out -->
            <!-- <div v-if="isShowingByStage(0)" id="top-remove">
                <div id="removebtn" @click="remove" class="clickbtn3" title="Remove All"></div>
            </div> -->
            <div v-if="isShowingByStage(0)" id="top-beacon-list">
                <div id="beaconListbtn" @click="beaconCountList" class="clickbtn3" title="Equipment List"></div>
            </div>
        </div>
        <div v-if="isShowingByStage(0)" id="rightContainer">
            <div id="upload">
                <button id="clickbtn" @click="$refs.file.click()">
                    <div id="btntitle" class="clickbtn4" title="Upload Map File">Upload <i class="fa fa-upload"></i></div>
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
            },
            beaconCountList() {
                EventBus.$emit('beaconCountList');
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
        border-radius: 100%;
        cursor: pointer;
        height: 2vw;
        width: 2vw;
        min-width: 20px;
        min-height: 20px;
        margin: 0 5px;
        border: 1px solid rgb(85, 185, 250);
        background-size: 40%;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url('../../public/static/location/imgs/garbage.svg');
    }
    #beaconListbtn {
        border-radius: 100%;
        cursor: pointer;
        height: 2vw;
        width: 2vw;
        min-width: 20px;
        min-height: 20px;
        margin: 0 5px;
        border: 1px solid rgb(85, 185, 250);
        background-size: 40%;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url('../../public/static/location/imgs/gadget_list.svg');
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
        color: rgb(85, 185, 250);
        background-color: white;
    }


    /*  Beacon Filter */

    #filter {
        display: inline-block;
    }

    #top-remove {
        display: inline-block;
    }

    #top-beacon-list {
        display: inline-block;
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

    .clickbtn {
        display: inline-block;
    }

    .clickbtn[title]:hover::after,
    .clickbtn[title]:focus::after {
        content: attr(title);
        position: absolute;
        transform: translate3d(-10%, 85%, 0);
        z-index: 1;
        width: auto;
        white-space: nowrap;
        background: gray;
        opacity: 0.7;
        color: #fff;
        border-radius: 3px;
        box-shadow: 7px 7px 5px 0 rgba(110, 105, 105, 0.1);
        font-size: 14px;
        padding: 5px 5px;
        border-width: 0.5em 0 0.5em 0.5em;
        border-color: transparent transparent transparent white;
        -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
        filter: drop-shadow(1px 2px 1px #bcbcbc);
    }
???
    .clickbtn3 {
        display: inline-block;
    }
    .clickbtn3[title]:hover::after,
    .clickbtn3[title]:focus::after {
        content: attr(title);
        position: absolute;
        transform: translate3d(30%, 85%, 0);
        z-index: 1;
        width: auto;
        white-space: nowrap;
        background: gray;
        opacity: 0.7;
        color: #fff;
        border-radius: 3px;
        box-shadow: 7px 7px 5px 0 rgba(110, 105, 105, 0.1);
        font-size: 14px;
        padding: 5px 5px;
        border-width: 0.5em 0 0.5em 0.5em;
        border-color: transparent transparent transparent white;
        -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
        filter: drop-shadow(1px 2px 1px #bcbcbc);
    }
???
    .clickbtn4 {
        display: inline-block;
    }
    .clickbtn4[title]:hover::after,
    .clickbtn4[title]:focus::after {
        content: attr(title);
        position: absolute;
        transform: translate3d(-160%, 45%, 0);
        z-index: 1;
        width: auto;
        white-space: nowrap;
        background: gray;
        opacity: 0.7;
        color: #fff;
        border-radius: 3px;
        box-shadow: 7px 7px 5px 0 rgba(110, 105, 105, 0.1);
        font-size: 14px;
        padding: 5px 5px;
        border-width: 0.5em 0 0.5em 0.5em;
        border-color: transparent transparent transparent white;
        -webkit-filter: drop-shadow(1px 2px 1px #bcbcbc);
        filter: drop-shadow(1px 2px 1px #bcbcbc);
    }
</style>
