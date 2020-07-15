<template>
    <div v-if="isType()">
      <div id="basePointInfoEditor" class="basepoint-info-container">
        <div class='panel-close-button' @click="handleCloseButton"></div>
        <div class="basepoint-info-title-container" :title="getItemName">
            {{ basePointInfo.name }}
        </div>
        <div class="basepoint-info-body-container">
          <div class="basepoint-info-body-content-container">
            <div class="basepoint-info-body-content-title">Name</div>
            <input type="text" class="basepoint-info-body-content-message" :value="getItemName"
                readonly>
          </div>

        </div>
        <div class="basepoint-info-button-container">
        </div>
      </div>
    </div>
</template>
<script>
export default {
    name: 'BasePointInfo',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
        id: {
          type: String
        }
    },
    data() {
        return {
            name: 'hi',
            basePointInfo: null,
        }
    },
    methods: {
      isType() {
          if (this.type == window.CONSTANTS.TYPE.SELECT_BASEPOINT) {
             this.basePointInfo = this.$store.getters.getBasePoint(this.id);
             return true;
          } else {
              return false;
          }
      },
      handleCloseButton() {
          this.$emit('select-close-button', {});
      },
    },
    computed: {
        getItemName() {
            return `${ this.basePointInfo.name }`;
        },
    },
    created() {
    }
}
</script>
<style>
.basepoint-info-container {
    position: absolute;
    width: 400px;
    height: 100%;
    right: 0;
    z-index: 1;
    background-color: #39b2ff;
    color: #fff;
    cursor: default;
    border-radius: 10px 0 0 10px!important;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;;
}
.basepoint-info-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.basepoint-info-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.basepoint-info-body-content-container {
    font-size: 1.4em;
}
.basepoint-info-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.basepoint-info-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 15px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    color: #1b94e2;
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
    cursor: default;
}
.basepoint-info-body-button-container {
    text-align: center;
}
.basepoint-info-body-tunnel-container {
    text-align: center;
}
.basepoint-info-body-tunnel-list-container {
    border: 1px solid;
    width: 100%;
    height: 1em;
}
.basepoint-info-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.panel-close-button {
    position: absolute;
    background-size: 20px !important;
    background-color: rgba(255 117 117) !important;
    background-image: url(../../public/static/location/imgs/close.svg);
    border-radius: 10px 0 0 10px!important;
    height: 40px;
    width: 40px;
    background-repeat: no-repeat;
    background-position: center center;
    left: -40px;
    top: 10px;
    cursor: pointer;
}
</style>