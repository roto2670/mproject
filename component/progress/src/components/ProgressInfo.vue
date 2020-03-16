<template>
    <div v-if="isEdit" id="progressInfoEditor" class="progress-info-container">
    </div>
    <div v-else id="progressInfoEditor" class="progress-info-container">
      <div class="progress-info-title-container">
        Progress Info
      </div>
      <div class="progress-info-body-container">
        <div class="progress-info-body-content-container">
          <div class="progress-info-body-content-title">Type</div>
          <input class="progress-info-body-content-message" id="progressType"
              type="text">
        </div>
        <div class="progress-info-body-content-container">
          <div class="progress-info-body-content-title">Name</div>
          <input class="progress-info-body-content-message" id="progressName"
              type="text" maxlength="30" @change="handleChangeProgressName" >
        </div>
        <div class="progress-info-body-content-container">
          <div class="progress-info-body-content-title">Length</div>
          <input class="progress-info-body-content-message" id="progressLength"
              type="text">
        </div>
        <div class="progress-info-body-content-container">
          <div class="progress-info-body-content-title">Direction</div>
          <input class="progress-info-body-content-message" id="progressDirection"
              type="text">
        </div>

        <div class="progress-info-body-button-container">
          <div class="progress-info-body-button-edit"
              @click="handleEditProgressButton">EDIT</div>
          <div class="progress-info-body-button-remove"
              @click="handleRemoveProgressButton">REMOVE</div>
        </div>

        <div class="progress-info-body-work-container">
          <div class="progress-info-body-work-list-container">
          </div>
          <div class="progress-info-body-work-button-container">
            <div class="progress-info-body-work-button-add"
                @click="handleAddWorkButton">ADD WORK</div>
          </div>
        </div>
      </div>
      <div class="progress-info-button-container">
        <div class="progress-info-ok-button"
            @click="handleOkButton">
          OK
        </div>
        <div class="progress-info-cancle-button"
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
        id: {
          type: String
        }
    },
    data() {
        return {
          isEdit: false,
          progressName: '',
          progressInfo: null,
        }
    },
    methods: {
      handleOkButton() {
          const data = {};
          data._id = this.id;
          data.name = this.progressName;
          this.$emit('select-ok-button', data);
      },
      handleCancelButton() {
          this.$emit('select-cancel-button', {});
      },
      handleEditProgressButton() {
      },
      handleRemoveProgressButton() {
      },
      handleAddWorkButton() {
          this.$emit('select-add-work-button', this.id);
      },
      handleChangeProgressName(e) {
          this.progressName = e.target.value;
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
    cursor: default;
}
.progress-info-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap
}
.progress-info-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.progress-info-body-content-container {
    font-size: 1.4em;
}
.progress-info-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 18px;
    display: inline-block;
}
.progress-info-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 18px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
    display: inline-bloc
}
.progress-info-body-button-container {
    text-align: center;
}
.progress-info-body-button-edit {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
}
.progress-info-body-button-remove {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
}
.progress-info-body-work-container {
    text-align: center;
}
.progress-info-body-work-list-container {
    border: 1px solid;
    width: 100%;
    height: 5em;
}
.progress-info-body-work-button-container {
}
.progress-info-body-work-button-add {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 12em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
}

.progress-info-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.progress-info-ok-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;
}
.progress-info-cancle-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    background-color: #ffffff;;
}
</style>