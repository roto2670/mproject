<template>
<div id="topContainer">
    <div id="leftContainer">
      <div id="zoom">
          <img id="clickbtnPlus" src="static/location/imgs/icon-plus.svg" @click="zoomIn">
          <img id="clickbtnMinus" src="static/location/imgs/icon-minus.svg" @click="zoomOut">
      </div>
      <div id="filter">
          <img id="clickbtnFilter" src="static/location/imgs/icon-filter.svg" @click="filter">
      </div>
    </div>
    <div id="rightContainer">
      <div id="upload">
          <button id="clickbtn" @click="$refs.file.click()">
              <div id="btntitle">Upload <i class="fa fa-upload"></i></div>
          </button>
          <input type="file" id="file" ref="file" @change="onFileChange"
              accept="image/jpeg, image/png, image/gif" />
      </div>
    </div>
</div>
</template>
<script>
import { EventBus } from "../main";
export default {
    name: 'Top',
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
        submitFile() {
            this.services.postMapFile(this.file, (url) => {
                window.location.reload();
            });
        },
        handleFileUpload() {
            this.file = this.$refs.file.files[0];
        },
        filter() {
            EventBus.$emit('filter');
        }
    },
    computed: {
        isEmptyUrl() {
            return !!!this.url;
        },
    },
    created() {
        this.getMapFile();
    }
}
</script>

<style>

#topContainer {
    width: 100%;
}

#leftContainer {
    width: 50%;
    display: inline-block;
}

#rightContainer {
    width: 50%;
    text-align: right;
    display: inline-block;
}

/*  Zoom */
#btntitle {
}

#zoom {
    display: inline-block;
}

#clickbtnPlus {
    margin: 0 5px;
    border-radius: 100%;
    cursor: pointer;
    height: 35px;
    width: 35px;
    border: 1px solid rgb(85, 185, 250);
    background-color: rgb(85, 185, 250);
}

#clickbtnMinus {
    margin: 0 5px;
    border-radius: 100%;
    cursor: pointer;
    height: 35px;
    width: 35px;
    border: 1px solid rgb(85, 185, 250);
    background-color: rgb(85, 185, 250);
}

/*  Upload Button */
#upload {
    right: 0;
}

input[type='file'] {
    display: none;
}

#clickbtn {
    display: inline-block;
    font-size: 15px;
    font-weight: 700;
    border-radius: 15px;
    cursor: pointer;
    height: 35px;
    width: 100px;
    border: 1px solid rgb(85, 185, 250);
    color: rgb(85, 185, 250)
}

/*  Beacon Filter */
#filter {
    display: inline-block;
}

#clickbtnFilter {
    border-radius: 100%;
    cursor: pointer;
    height: 35px;
    width: 35px;
    margin: 0 5px;
    border: 1px solid rgb(85, 185, 250);
    background-color: rgb(85, 185, 250);
}
</style>
