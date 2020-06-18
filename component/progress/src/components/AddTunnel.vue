<template>
    <div v-if="isType()" id="tunnelAddEditor" class="tunnel-add-container">
      <div class="tunnel-add-title-container">
        ADD TUNNEL
      </div>
      <div class="tunnel-add-body-container">
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Category</div>
            <select id="category" class="work-info-body-content-message"
                @change="handleChangeCategory">
                <option value=100 selected>TH</option>
                <option value=101>B1</option>
                <option value=102>B2</option>
            </select>
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Direction</div>
            <select id="direction" class="work-info-body-content-message"
                @change="handleChangeDirection">
                <option value=0 selected>EAST</option>
                <option value=1>WEST</option>
            </select>
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Tunnel</div>
          <input id="tunnelName" type="text" class="tunnel-add-body-content-message"
              onkeyup="this.value=this.value.toUpperCase();"
              maxlength="3" @change="handleChangeName">
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Tunnel ID</div>
          <input id="tunnelId" type="text" class="tunnel-add-body-content-message"
              :value="getTunnelId()" readonly>
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Length</div>
          <input id="tunnelLength" type="number" class="tunnel-add-body-content-message"
              :value="getTunnelLength()" @change="handleChangeLength">
        </div>
      </div>
      <div class="tunnel-add-button-container">
        <div class="tunnel-add-ok-button"
            @click="handleOkButton">
          OK
        </div>
        <div class="tunnel-add-cancle-button"
            @click="handleCancelButton">
          CANCEL
        </div>
      </div>
    </div>
</template>
<script>
import { EventBus } from "@/main";
export default {
    name: 'AddTunnel',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        }
    },
    data() {
        return {
            category: 100,
            direction: 0,
            tunnelId: '',
            tunnelName: '',
            tunnelLength: 100
        }
    },
    methods: {
        _setTunnelId() {
            this.tunnelId = this.tunnelName + this._getCategoryName(this.category) + this._getDirectionName(this.direction);
        },
        _getCategoryName(categoryId) {
            if (categoryId == window.CONSTANTS.TUNNEL_CATEGORY.TH) {
                return "TH";
            } else if (categoryId == window.CONSTANTS.TUNNEL_CATEGORY.B1) {
                return "B1";
            } else {
                return "B2";
            }
        },
        _getDirectionName(directionId) {
            if (directionId == window.CONSTANTS.DIRECTION.EAST) {
                return "E";
            } else {
                return "W";
            }
        },
        isType() {
            return this.type == window.CONSTANTS.TYPE.ADD_TUNNEL;
        },
        _initData() {
            this.category = 100,
            this.direction = 0
            this.tunnelId = ''
            this.tunnelName = ''
            this.tunnelLength = 0
        },
        handleOkButton() {
            let data = {
                category: this.category,
                tunnelId: this.tunnelId,
                tunnelName: this.tunnelName,
                tunnelDirection: this.direction,
                tunnelLength: this.tunnelLength
            }
            if (tunnelName !== null) {
                this.$emit('select-ok-button', data);
            } else {
            }
        },
        handleCancelButton() {
            this.$emit('select-cancel-button', {});
        },
        handleChangeName(e) {
            this.tunnelName = e.target.value;
            this._setTunnelId();
        },
        handleChangeLength(e) {
            this.tunnelLength = parseInt(e.target.value);
            this.$emit('change-tunnel-length', this.tunnelLength, this.direction);
        },
        handleChangeDirection(e) {
            this.direction = e.target.value;
            this._setTunnelId();
            this.$emit('change-tunnel-direction', this.direction, this.tunnelLength);
        },
        handleChangeCategory(e) {
            this.category = e.target.value;
            this._setTunnelId();
        },
        getTunnelId() {
            this.tunnelId = this.tunnelName + this._getCategoryName(this.category) + this._getDirectionName(this.direction);
            return this.tunnelId;
        },
        getTunnelLength() {
            return this.tunnelLength;
        },
    },
    computed: {
    },
    created() {
        EventBus.$on('add-tunnel-status-init', (v) => {
            this._initData();
        })
    },
}
</script>
<style>
.tunnel-add-container {
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
.tunnel-add-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
}
.tunnel-add-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.tunnel-add-body-content-container {
    font-size: 1.4em;
}
.tunnel-add-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.tunnel-add-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 15px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
    color: #1b94e2;
}
.tunnel-add-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.tunnel-add-ok-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
.tunnel-add-cancle-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
</style>