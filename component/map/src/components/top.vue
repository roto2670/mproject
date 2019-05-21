<template>
<div id="topContainer">
    <div id="leftContainer">
      <div id="zoom" class="subContainer">
          <img id="clickbtnPlus" src="icon-plus.svg" @click="zoomIn">
          <img id="clickbtnMinus" src="icon-minus.svg" @click="zoomOut">
      </div>
      <div id="filter" class="container">
          <img id="clickbtnFilter" src="icon-alert.svg" @click="filter">
      </div>
    </div>
    <div id="rightContainer">
      <div id="upload" class="subContainer">
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
        },
        filter() {
            EventBus.$emit('filter');
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
/*  Zoom */
#btntitle {
}

#zoom {
    position: absolute;
    z-index: 1;
}
#clickbtnPlus {
    border-radius: 100%;
    cursor: pointer;
    height: 35px;
    width: 35px;
    background-color: rgb(85, 185, 250);
}

#clickbtnPlus:hover {
    border-radius: 100%;
    display: inline-block;
    cursor: pointer;
}

#clickbtnMinus {
    margin-left: 10px;
    border-radius: 100%;
    cursor: pointer;
    height: 35px;
    width: 35px;
    background-color: rgb(85, 185, 250);
}

#clickbtnMinus:hover {
    border-radius: 100%;
    display: inline-block;
    cursor: pointer;
}

/*  Upload Button */
#upload {
    position: absolute;
    right: 0;
    z-index: 1;
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
    float: right;
    margin-right: 15px;
}

#clickbtn:hover {
    display: inline-block;
    cursor: pointer;
}

/*  Beacon Filter */
#filter {
    width: 10%;
    position: absolute;
    z-index: 1;
    margin-left: 8%;
}

#clickbtnFilter {
    border-radius: 50%;
    cursor: pointer;
    height: 35px;
    width: 35px;
}

#clickbtnFilter:hover {
    box-shadow: 2px 2px 0.5px #aaaaaa;
}

</style>
