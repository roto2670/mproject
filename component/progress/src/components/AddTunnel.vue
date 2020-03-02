<template>
    <div id="progressEditor" class="progress-editor-container">
      <div class="progress-editor-title-container">
        hi
      </div>
      <div class="progress-editor-body-container">
        <div>type</div>
        <div>name</div>
        <div>length</div>
        <div>direction</div>
      </div>
      <div class="progress-editor-button-container">
        <div class="progress-editor-ok-button"
            @click="handleOkButton">
          OK
        </div>
        <div class="progress-editor-cancle-button"
            @click="handleCancelButton">
          CANCEL
        </div>
      </div>
    </div>
</template>
<script>
export default {
    name: 'AddTunnel',
    components: {
    },
    props: {
        type: {
            type: String,
            default: 0
        },
    },
    data() {
        return {
        }
    },
    methods: {
      handleOkButton() {
          this.$emit('select-ok-button', {});
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
      }
    },
    computed: {
    },
    created() {
    }
}
</script>
<style>
.progress-editor-container {
  position: absolute;
  width: 400px;
  height: 100%;
  right: 0;
  z-index: 1;
  background-color: red;
}
.progress-editor-title-container {
  width: 100%;
  height: 10%;
  text-align: center;
}
.progress-editor-body-container {
  width: 100%;
  height: 80%;
}
.progress-editor-button-container {
  width: 100%;
  height: 10%;
  text-align: center;
}
.progress-editor-ok-button {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  border: 1px solid;
  font-size: 20px;
}
.progress-editor-cancle-button {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  border: 1px solid;
  font-size: 20px;
}
</style>