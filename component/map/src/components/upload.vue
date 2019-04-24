<template>
<div :id="id" class="container">
    <button id="clickbtn" @click="$refs.file.click()">
        <p id="btntitle">Upload<i class="fa fa-upload"></i></p>
    </button>
    <input type="file" id="file" ref="file" @change="onFileChange" accept="image/jpeg, image/png, image/gif" />
</div>
</template>
<script>
import * as maptalks from 'maptalks'
import mapvue from '@/components/map'
export default {
    name: 'Upload',
    data() {
        return {
            id: 'upload'
        }
    },
    methods: {
        onFileChange(e) {
            this.file = e.target.files[0]
            this.submitFile()
        },
        getMapFile(successCallback) {
            this.services.getMapFile
            /*services.getMapFiles((url) => {
                console.log("afaf", url)
                successCallback(url)
            })*/
        },
        submitFile() {
            this.services.postMapFile(this.file, (url) => {
                console.log("adadada",url)
            })
        },
        handleFileUpload() {
            this.file = this.$refs.file.files[0]
        }
    },
    computed: {
        isEmptyUrl() {
            return !!!this.url
        },
    },
    created() {
        this.getMapFile()
    }
}
</script>

<style>
#upload {
    position: absolute;
    margin-left: 90%;
    z-index: 1;
}

input[type='file'] {
    display: none;
}

#btntitle {
    margin-block-start: 7px;
}

#clickbtn {
    border-radius: 15px;
    display: inline-block;
    margin-right: 20px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 2px 2px 0.5px #aaaaaa;
    height: 35px;
    width: 120px;
}

#clickbtn:hover {
    border-radius: 15px;
    display: inline-block;
    box-shadow: 2px 2px 0.5px #aaaaaa;
    cursor: pointer;
}

</style>
