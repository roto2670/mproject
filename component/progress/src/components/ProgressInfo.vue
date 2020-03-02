<template>
    <div id="progressEditor" class="progress-info-container">
      <div class="progress-editor-title-container">
        P Info
      </div>
      <div class="progress-editor-body-container">
        <div @click="handleAddWorkButton">ADD work</div>
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
    name: 'ProgressInfo',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: 0
        },
        id: {
          type: Number
        }
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
      },
      handleAddWorkButton() {
          this.$emit('select-add-work-button', this.id);
      },
    },
    computed: {
    },
    created() {
    }
}
</script>
<style>
.progress-info-container {
  position: absolute;
  width: 400px;
  height: 100%;
  right: 0;
  z-index: 1;
  background-color: skyblue;
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