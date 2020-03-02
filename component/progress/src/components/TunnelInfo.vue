<template>
    <div id="progressEditor" class="tunnel-info-container">
      <div class="progress-editor-title-container">
        Tnfo
      </div>
      <div class="progress-editor-body-container">
        <div @click="handleAddProgressButton">ADD PROGRESS</div>
        <div>type</div>
        <div>name
          <input type="text" class="ga-name-input" v-model="name" maxlength="30" />
        </div>
        <div>length
          <input type="text" class="ga-name-input" v-model="length" maxlength="30" />
        </div>
        <div>direction
          <input type="text" class="ga-name-input" v-model="direction" maxlength="30" />
        </div>
        <div @click="handleRemoveTunnelButton">REMOVE</div>
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
    name: 'TunnelInfo',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: 0
        },
        id: {
          type: String
        }
    },
    data() {
        return {
            name: '',
            length: '',
            direction: ''
        }
    },
    methods: {
      handleOkButton() {
          const data = {}
          data._id = this.id
          data.name = this.name;
          data.width = this.length;
          data.prog_dir = this.direction;
          this.$emit('select-ok-button', data);
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
      },
      handleAddProgressButton() {
          this.$emit('select-add-progress-button', this.id, this.type);
      },
      handleRemoveTunnelButton() {
          this.$emit('select-remove-tunnel-button', this.id);
      },
    },
    computed: {
    },
    created() {
    }
}
</script>
<style>
.tunnel-info-container {
  position: absolute;
  width: 400px;
  height: 100%;
  right: 0;
  z-index: 1;
  background-color: green;
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
.ga-name-input {
    width: 80%;
    height: 100%;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    right: 100;
    box-sizing: border-box;
}
</style>