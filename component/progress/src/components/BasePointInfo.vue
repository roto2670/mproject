<template>
    <div v-if="isType()">
      <div v-if="isEdit" id="basePointInfoEditor" class="basepoint-info-container">
        <div class="basepoint-info-title-container" :title="getItemName">
            {{ basePointInfo.name }}
        </div>
        <div class="basepoint-info-body-container">
          <div class="basepoint-info-body-content-container">
            <div class="basepoint-info-body-content-title">Name</div>
            <input type="text" class="basepoint-info-body-content-message" :value="getItemName"
                @change="handleChangeBasePointName">
          </div>
        </div>
        <div class="basepoint-info-button-container">
          <div class="basepoint-info-ok-button"
              @click="handleOkButton">
            OK
          </div>
          <div class="basepoint-info-cancle-button"
              @click="handleCancelButton">
            CANCEL
          </div>
        </div>
      </div>
      <div v-else id="basePointInfoEditor" class="basepoint-info-container">
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
          <div class="basepoint-info-body-button-container">
            <div class="basepoint-info-body-button-edit"
                @click="handleEditTunnelButton" disabled>EDIT</div>
            <div class="basepoint-info-body-button-remove"
                @click="handleRemoveTunnelButton" disabled>REMOVE</div>
          </div>
          <div class="basepoint-info-body-tunnel-container">
            <!--
            <div class="basepoint-info-body-tunnel-list-container">
            </div>
            -->
            <div class="basepoint-info-body-tunnel-button-container">
              <div class="basepoint-info-body-tunnel-button-add"
                  @click="handleAddCavernButton">ADD TUNNEL</div>
            </div>
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
            isEdit: false,
            name: '',
            basePointInfo: null,
        }
    },
    methods: {
        _clear() {
            this.isEdit = false;
            this.name = '';
            this.basePointINfo = null;
        },
        isType() {
            if (this.type == window.CONSTANTS.TYPE.SELECT_BASEPOINT) {
                this.basePointInfo = this.$store.getters.getBasePoint(this.id);
                return true;
            } else {
                return false;
            }
        },
        handleOkButton() {
            let data = {};
            data.id = this.id;
            data.name = this.name;
            this.$emit('select-ok-button', data);
            this.isEdit = false;
            this.basePointInfo = this.$store.getters.getBasePoint(this.id);
        },
        handleCancelButton() {
            this.isEdit = false;
        },
        handleCloseButton() {
            this.$emit('select-close-button', {});
            this._clear();
        },
        handleEditTunnelButton() {
            this.isEdit = true;
        },
        handleRemoveTunnelButton() {
            let data = {};
            data.basepoint_id = this.id;
            this.services.getTunnelListByBasePoint(data, (resData) => {
                if (resData.length == 0) {
                    this.$emit('select-remove-basepoint-button', this.id);
                } else {
                    this.sweetbox.fire("Deletion not possible because child data exists.");
                }
            });
        },
        handleAddCavernButton() {
            this.$emit('select-add-cavern-button', this.id);
        },
        handleChangeBasePointName(e) {
            this.name = e.target.value;
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
    background-color: #39B2FF;
    color: #ffffff;
    cursor: default;
    border-radius: 10px 0 0 10px!important;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
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
.basepoint-info-body-button-edit {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
}
.basepoint-info-body-button-remove {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
}
.basepoint-info-body-tunnel-container {
    text-align: center;
}
.basepoint-info-body-tunnel-list-container {
    border: 1px solid;
    width: 100%;
    height: 1em;
}
.basepoint-info-body-tunnel-button-container {
}
.basepoint-info-body-tunnel-button-add {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 13em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
}
.basepoint-info-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.basepoint-info-ok-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    color: #1b94e2;
    background-color: #fffff1;
    box-shadow: 2px 2px;
}
.basepoint-info-cancle-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid rgb(220, 220, 220);
    color: #1b94e2;
    background-color: #fffff1;
    box-shadow: 2px 2px;
}
.panel-close-button {
    position: absolute;
    background-size: 20px !important;
    background-color: rgba(255 117 117) !important;
    background-image: url(../../public/static/imgs/close.png);
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