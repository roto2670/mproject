<template>
  <div id="app">
    <div class="container" style="text-align:center;">
      <button @click="$refs.file.click()">
          <h1>Upload Image</h1>
      </button>
      <input type="file" id="file" ref="file" @change="onFileChange" accept="image/jpeg, image/png, image/gif" />
      </br>
      <img v-if="!isEmptyUrl" :src="url" />
      </br>
    </div>
  </div>
</template>

<script>

  export default {
    data() {
      return {
        file: '',
        url: '',
      }
    },
    methods: {
      onFileChange(e) {
        this.file = e.target.files[0]
        this.submitFile()
      },
      getImgFile() {
        const SERVER_BASE_URL = 'http://localhost:8000'
        this.$http({
          url: SERVER_BASE_URL + '/work/schedule',
          method: 'GET',
          responseType: 'text' // important
        }).then(response => {
          if (!!response.data) {
            console.log('rs: ', response)
            this.url = 'http://' + window.location.host + response.data
            console.log('thisurl2', this.url)
          } else {
            console.log('File is not exist')
          }
        })
      },
      submitFile() {
        let formData = new FormData()
        if (!!this.file) {
          formData.append('file', this.file)
          this.$http
            .post('http://localhost:8000/work/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
            .then(e => {
              console.log('SUCCESS!!')
              this.url = URL.createObjectURL(this.file)
            })
            .catch(e => {
              console.log('FAILURE!!')
            })
        }
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
      this.getImgFile()
    }
  }

</script>

<style>

  input[type='file'] {
    position: absolute;
    top: -500px;
  }

  button {
    background-color: #cee0e3;
    border-radius: 15px;
    display: inline-block;
  }

  img {
    padding-top: 30px;
    max-width: 100%;
    max-height: 500px;
  }

</style>
