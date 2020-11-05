<template>
    <div v-if="isType()" id="tunnelAddEditor" class="tunnel-add-container">
      <div class="tunnel-add-title-container">
        ADD TUNNEL
      </div>
      <div class="tunnel-add-body-container">
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Category</div>
            <select id="category" class="tunnel-add-body-content-message"
                @change="handleChangeCategory">
                <option value=100 selected>Top Heading(TH)</option>
                <option value=101>Bench-01(B1)</option>
                <option value=102>Bench-02(B2)</option>
            </select>
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Direction</div>
            <select id="direction" class="tunnel-add-body-content-message"
                :value="getDirection"
                @change="handleChangeDirection">
                <option v-for="(value, key) in getDirectionList" :value="key" :key="value"
                    :selected="isDirectionSelect(key)">
                    {{ value }}
                </option>
            </select>
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Tunnel</div>
          <select id="tunnelName" class="tunnel-add-body-content-message"
              @change="handleChangeName">
              <option value='C1' selected>C1</option>
              <option value='C2'>C2</option>
              <option value='C3'>C3</option>
          </select>
          <select id="tunnelName2" class="tunnel-add-body-content-message sub"
              @change="handleChangeName2">
              <option value='A'>A</option>
              <option value='B'>B</option>
              <option value='C'>C</option>
              <option value='D'>D</option>
          </select>
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Tunnel ID</div>
          <input id="tunnelId" type="text" class="tunnel-add-body-content-message default-cursor"
              :value="getTunnelId()" readonly>
        </div>
        <div class="tunnel-add-body-content-container">
          <div class="tunnel-add-body-content-title">Length (m)</div>
          <input id="tunnelLength" type="number" class="tunnel-add-body-content-message"
              step="0.1" :value="getTunnelLength()"
              @change="handleChangeLength">
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
export default {
    name: 'AddTunnel',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
        basePointId: {
            type: String
        },
        tunnelIdList: {
            type: Array
        }
    },
    data() {
        return {
            category: 100,
            direction: 0,
            changeBlock: false,
            tunnelId: '',
            tunnelName: 'C1',
            tunnelName2: 'A',
            totalTunnelName: 'C1A',
            tunnelLength: 100.0,
            thList: {0: "EAST", 1: "WEST"},
            bhList: {2: "East Side - EAST", 3: "East Side - WEST",
                     4: "West Side - EAST", 5: "West Side - WEST"}
        }
    },
    methods: {
        _setTunnelId() {
            this.totalTunnelName = this.tunnelName + this.tunnelName2;
            this.tunnelId = this.totalTunnelName + this._getCategoryName(this.category) + this._getDirectionName(this.direction);
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
            if (directionId == window.CONSTANTS.DIRECTION.EAST ||
                directionId == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                directionId == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                return "E";
            } else {
                return "W";
            }
        },
        _clearData() {
            this.category = 100;
            this.direction = 0;
            this.changeBlock = false;
            this.tunnelId = '';
            this.tunnelName = 'C1';
            this.tunnelName2 = 'A';
            this.totalTunnelName = 'C1A';
            this.tunnelLength = 100.0;
        },
        isType() {
            return this.type == window.CONSTANTS.TYPE.ADD_TUNNEL;
        },
        isDirectionSelect(value) {
            return this.direction == parseInt(value);
        },
        handleOkButton() {
            let data = {
                category: this.category,
                tunnelId: this.tunnelId,
                tunnelName: this.totalTunnelName,
                tunnelSection: this.tunnelName,
                tunnelPart: this.tunnelName2,
                tunnelDirection: this.direction,
                tunnelLength: this.tunnelLength
            }
            if (tunnelName !== null) {
                this.$emit('select-ok-button', data);
                this._clearData();
            } else {
            }
        },
        handleCancelButton() {
            this.$emit('select-cancel-button', {});
            this._clearData();
        },
        handleChangeName(e) {
            this.tunnelName = e.target.value;
            this._setTunnelId();
        },
        handleChangeName2(e) {
            this.tunnelName2 = e.target.value;
            this._setTunnelId();
        },
        handleChangeLength(e) {
            this.tunnelLength = parseFloat(e.target.value);
            this.$emit('change-tunnel-length', this.tunnelLength, this.direction);
        },
        handleChangeDirection(e) {
            this.changeBlock = true;
            console.log(this.tunnelIdList)
            if (this.tunnelIdList == 0) {
                this.direction = e.target.value;
                this._setTunnelId();
                this.$emit('change-tunnel-direction', this.direction, this.tunnelLength);
            } else {
                const otherDirection = this.$store.getters.getTunnel(this.tunnelIdList[0]).direction;
                let changeTmp = e.target.value;
                if (otherDirection == window.CONSTANTS.DIRECTION.EAST ||
                    otherDirection == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                    otherDirection == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                    if (changeTmp == window.CONSTANTS.DIRECTION.EAST ||
                        changeTmp == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                        changeTmp == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                        this.sweetbox.fire("Another tunnel already exists in the direction you want to change. Tunnel cannot be created in the selected direction.");
                    } else {
                        this.direction = e.target.value;
                        this._setTunnelId();
                        this.$emit('change-tunnel-direction', this.direction, this.tunnelLength);
                    }
                } else {
                    if (changeTmp == window.CONSTANTS.DIRECTION.WEST ||
                        changeTmp == window.CONSTANTS.DIRECTION.EAST_SIDE_WEST ||
                        changeTmp == window.CONSTANTS.DIRECTION.WEST_SIDE_WEST) {
                        this.sweetbox.fire("Another tunnel already exists in the direction you want to change. Tunnel cannot be created in the selected direction.");
                    } else {
                        this.direction = e.target.value;
                        this._setTunnelId();
                        this.$emit('change-tunnel-direction', this.direction, this.tunnelLength);
                    }
                }
            }
        },
        handleChangeCategory(e) {
            this.category = e.target.value;
            if (this.category == 100) { // TH
                if (this.direction == window.CONSTANTS.DIRECTION.EAST ||
                    this.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                    this.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                    this.direction = window.CONSTANTS.DIRECTION.EAST;
                } else {
                    this.direction = window.CONSTANTS.DIRECTION.WEST;
                }
            } else {
                if (this.direction == window.CONSTANTS.DIRECTION.EAST ||
                    this.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                    this.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                    this.direction = window.CONSTANTS.DIRECTION.EAST_SIDE_EAST;
                } else {
                    this.direction = window.CONSTANTS.DIRECTION.EAST_SIDE_WEST;
                }
            }
            this.$emit('change-tunnel-direction', this.direction, this.tunnelLength);
            this._setTunnelId();
        },
        getTunnelId() {
            this.tunnelId = this.totalTunnelName + this._getCategoryName(this.category) + this._getDirectionName(this.direction);
            return this.tunnelId;
        },
        getTunnelLength() {
            return this.tunnelLength.toFixed(1);
        },
    },
    computed: {
        getDirection() {
            if (!!!this.changeBlock){
                console.log("no block : ", this.category)
                if (this.tunnelIdList.length == 1) {
                    const otherTunnel = this.$store.getters.getTunnel(this.tunnelIdList[0]);
                    if (this.category == 100) {
                        if (otherTunnel.direction == window.CONSTANTS.DIRECTION.EAST ||
                            otherTunnel.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                            otherTunnel.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                            this.direction = 1;
                        } else {
                            this.direction = 0;
                        }
                    } else if (this.category == 101) {
                        if (otherTunnel.direction == window.CONSTANTS.DIRECTION.EAST ||
                            otherTunnel.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                            otherTunnel.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                            this.direction = 3;
                        } else {
                            this.direction = 2;
                        }
                    } else if (this.category == 102) {
                        if (otherTunnel.direction == window.CONSTANTS.DIRECTION.EAST ||
                            otherTunnel.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                            otherTunnel.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                            this.direction = 5;
                        } else {
                            this.direction = 4;
                        }
                    }
                }
            }
            return this.direction;
        },
        getDirectionList() {
            if (this.category == 100) {
                return this.thList;
            } else {
                return this.bhList;
            }
        }
    },
    created() {
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
.tunnel-add-body-content-message.sub {
    margin-left: 30%;
    margin-bottom: 0.7em;
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
.default-cursor {
    cursor: default;
}
</style>