<template>
    <div v-if="isType()">
        <div v-if="isEdit" id="tunnelInfoEditor" class="tunnel-info-container">
            <div class="tunnel-info-title-container" :title="getItemName">
                {{ tunnelInfo.tunnel_id }}
            </div>
            <div class="tunnel-info-body-container edit">
                <div class="tunnel-add-body-content-container">
                    <div class="tunnel-add-body-content-title">Category</div>
                    <select id="category" class="tunnel-add-body-content-message"
                        :value="getCategory"
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
                        :value="getSection"
                        @change="handleChangeName">
                        <option value='C1' selected>C1</option>
                        <option value='C2'>C2</option>
                        <option value='C3'>C3</option>
                    </select>
                    <select id="tunnelName2" class="tunnel-add-body-content-message sub"
                        :value="getPart"
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
                        :value="getTunnelId" readonly>
                </div>
                <div class="tunnel-add-body-content-container">
                    <div class="tunnel-add-body-content-title">Length (m)</div>
                    <input id="tunnelLength" type="number" class="tunnel-add-body-content-message"
                        step="0.1" :value="getTunnelLength"
                        @change="handleChangeLength">
                </div>
            </div>
            <div class="tunnel-info-button-container">
                <div class="tunnel-info-ok-button"
                    @click="handleOkButton">
                OK
                </div>
                <div class="tunnel-info-cancle-button"
                    @click="handleCancelButton">
                CANCEL
                </div>
            </div>
        </div>
        <div v-else id="tunnelInfoEditor" class="tunnel-info-container">
            <div class='panel-close-button' @click="handleCloseButton"></div>
            <div class="tunnel-info-title-container" :title="getItemName">
                {{ tunnelInfo.tunnel_id }}
            </div>
            <div class="tunnel-info-body-container">
                <div class="tunnel-info-body-content-container">
                    <div class="tunnel-info-body-content-title">Tunnel ID</div>
                    <input type="text" class="tunnel-info-body-content-message" :value="getItemName"
                        readonly>
                </div>
                <div class="tunnel-info-body-content-container">
                    <div class="tunnel-info-body-content-title">Progress</div>
                    <input type="text" class="tunnel-info-body-content-message" :value="getLength"
                        readonly>
                </div>
                <div class="tunnel-info-body-content-container">
                    <div class="tunnel-info-body-content-title">Started Date</div>
                    <input v-if="isStarted()" type="text" class="tunnel-info-body-content-message"
                        :value="getStartTime" readonly>
                    <input v-else type="text" class="tunnel-info-body-content-message" value="Not Started"
                        readonly>
                </div>
                <div class="tunnel-info-body-content-container line">
                    <div class="tunnel-info-body-content-title">Time Elapse</div>
                    <input type="text" class="tunnel-info-body-content-message" :value="getTotalTime"
                        readonly>
                </div>
                <div class="tunnel-info-progress-detail-container">
                    <div class="detail-title-container" @click="handleProgressDetail">
                        <div class="detail-title">Progress Detail </div>
                        <div class="button-image position" :class="{ down : isClose }"></div>
                    </div>
                    <div id="detailInfo" class="detail-container" :class="{ close: isClose }">
                        <div class="tunnel-info-body-content-container fold">
                            <div class="tunnel-info-body-content-title fold">1) Total Blasting No.</div>
                            <input type="text" class="tunnel-info-body-content-message fold" :value="getBlastingNo"
                                readonly>
                        </div>
                        <div class="tunnel-info-body-content-container fold">
                            <div class="tunnel-info-body-content-title fold">2) Blasting Efficiency</div>
                            <input type="text" class="tunnel-info-body-content-message fold" :value="getBlastingEff"
                                readonly>
                        </div>
                        <div class="tunnel-info-body-content-container fold">
                            <div class="tunnel-info-body-content-title fold">3) Cycle Time</div>
                            <input type="text" class="tunnel-info-body-content-message fold" :value="getCycleMax"
                                readonly>
                            <input type="text" class="tunnel-info-body-content-message fold sub" :value="getCycleMin"
                                readonly>
                            <input type="text" class="tunnel-info-body-content-message fold sub" :value="getCycleAvg"
                                readonly>
                        </div>
                        <div class="tunnel-info-body-content-container fold line">
                            <div class="tunnel-info-body-content-title fold">4) Productivity</div>
                            <input type="text" class="tunnel-info-body-content-message fold" :value="getProductivityMax"
                                readonly>
                            <input type="text" class="tunnel-info-body-content-message fold sub" :value="getProductivityMin"
                                readonly>
                            <input type="text" class="tunnel-info-body-content-message fold sub" :value="getProductivityAvg"
                                readonly>
                        </div>
                    </div>
                    <div class="tunnel-info-body-button-container">
                        <div class="tunnel-info-body-button-edit"
                            @click="handleEditTunnelButton">EDIT</div>
                        <div class="tunnel-info-body-button-remove"
                            @click="handleRemoveTunnelButton">REMOVE</div>
                    </div>
                    <div class="tunnel-info-body-blast-container">
                        <!--
                        <div class="tunnel-info-body-blast-list-container">
                        </div>
                            -->
                        <div class="tunnel-info-body-blast-button-container">
                            <div class="tunnel-info-body-blast-button-add"
                                @click="handleAddBlastButton">Start Work</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tunnel-info-button-container"></div>
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
            default: -1
        },
        id: {
          type: String
        },
        tunnelList: {
            type: Array,
            default: []
        },
    },
    data() {
        return {
            isEdit: false,
            name: '',
            length: '',
            direction: '',
            tunnelInfo: null,
            totalTimestamp: 0,
            cycleMin: 0,
            bLengthMin: 0,
            cycleMax: 0,
            bLengthMax: 0,
            isClose: true,
            category: '',
            direction: '',
            tunnelLength: '',
            tunnelId: '',
            section: '',
            part: '',
            tunnelName: '',
            tunnelName2: '',
            totalTunnelName: '',
            thList: {0: "EAST", 1: "WEST"},
            bhList: {2: "East Side - EAST", 3: "East Side - WEST",
                     4: "West Side - EAST", 5: "West Side - WEST"}
        }
    },
    methods: {
        _clearData() {
            this.isEdit = false;
            this.name = '';
            this.length = '';
            this.direction = '';
            this.tunnelInfo = null;
            this.totalTimestamp = 0;
            this.cycleMin = 0;
            this.bLengthMin = 0;
            this.cycleMax = 0;
            this.bLengthMax = 0;
            this.isClose = true;
            this.category = '';
            this.direction = '';
            this.section = '';
            this.part = '';
            this.tunnelName = '',
            this.tunnelName2 = '',
            this.totalTunnelName = '',
            this.tunnelLength = '';
        },
        _setCycleMin(blast) {
            if (this.cycleMin == 0 || this.cycleMin >= blast.accum_time) {
                this.cycleMin = blast.accum_time;
                this.bLengthMin = blast.blast_info.blasting_length;
            }
        },
        _setCycleMax(blast) {
            if (this.cycleMax <= blast.accum_time) {
                this.cycleMax = blast.accum_time;
                this.bLengthMax = blast.blast_info.blasting_length;
            }
        },
        isType() {
            if (this.type == window.CONSTANTS.TYPE.SELECT_CAVERN) {
                this.tunnelInfo = this.$store.getters.getTunnel(this.id);
                return true;
            } else {
                return false;
            }
        },
        isDirectionSelect(value) {
            return this.direction == value;
        },
        isStarted() {
            return this.tunnelInfo.initial_b_time != 'None';
        },
        handleOkButton() {
            const data = {};
            data.id = this.id;
            data.category = this.category;
            data.tunnelId = this.tunnelId;
            data.tunnelName = this.totalTunnelName;
            data.tunnelSection = this.section;
            data.tunnelPart = this.part;
            data.tunnelDirection = this.direction;
            data.tunnelLength = this.tunnelLength
            this.$emit('select-ok-button', data);
            this._clearData();
            this.isEdit = false;
        },
        handleCancelButton() {
            this._clearData()
            this.$emit('select-edit-cancel-button', this.id)
        },
        handleCloseButton() {
            this.$emit('select-close-button', {});
            this._clearData();
        },
        handleEditTunnelButton() {
            this.isEdit = true;
            this.$emit('select-add-cavern-button', this.tunnelInfo.basepoint_id, this.id);
        },
        handleRemoveTunnelButton() {
            let data = {};
            data.tunnel_id = this.id;
            this.services.getBlastListByTunnel(data, (resData) => {
                if (resData.length == 0) {
                    this.$emit('select-remove-tunnel-button', this.id);
                } else {
                    this.sweetbox.fire("Deletion not possible because child data exists.");
                }
            })
        },
        handleAddBlastButton() {
            this.$emit('select-add-blast-button', this.id, window.CONSTANTS.TUNNEL_TYPE.CAVERN);
            this._clearData();
        },
        handleProgressDetail() {
            this.isClose = !this.isClose;
        },
        handleChangeCategory(e) {
            this.category = e.target.value;
            if (this.category == 100) { // TH
                if (this.tunnelInfo.direction == window.CONSTANTS.DIRECTION.EAST ||
                    this.tunnelInfo.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                    this.tunnelInfo.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                    this.direction = window.CONSTANTS.DIRECTION.EAST;
                } else {
                    this.direction = window.CONSTANTS.DIRECTION.WEST;
                }
            } else {
                if (this.tunnelInfo.direction == window.CONSTANTS.DIRECTION.EAST ||
                    this.tunnelInfo.direction == window.CONSTANTS.DIRECTION.EAST_SIDE_EAST ||
                    this.tunnelInfo.direction == window.CONSTANTS.DIRECTION.WEST_SIDE_EAST) {
                    this.direction = window.CONSTANTS.DIRECTION.EAST_SIDE_EAST;
                } else {
                    this.direction = window.CONSTANTS.DIRECTION.EAST_SIDE_WEST;
                }
            }
            this.$emit('change-tunnel-direction', this.direction, this.tunnelLength);
            this._setTunnelId();
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
        _setTunnelId() {
            this.totalTunnelName = this.tunnelName + this.tunnelName2;
            this.tunnelId = this.totalTunnelName + this._getCategoryName(this.category) + this._getDirectionName(this.direction);
        },
        handleChangeDirection(e) {
            const tunnelId = this.id;
            let changeDirection = null,
                otherDirection = null,
                otherTunnelID = this.tunnelList.find(function(item) {
                    return item !== tunnelId;
                }),
                otherTunnel = this.$store.getters.getTunnel(otherTunnelID);
            this.direction = e.target.value;
            if (this.direction == "1" || this.direction == "3" || this.direction == "5") {
                changeDirection = "WEST";
            } else {
                changeDirection = "EAST";
            }
            if(!!otherTunnel) {
                if (otherTunnel.direction == 1 || otherTunnel.direction == 3 || otherTunnel.direction == 5) {
                    otherDirection = "WEST";
                } else {
                    otherDirection = "EAST";
                }
            }
            if (!!!otherTunnel){
                this._setTunnelId();
                this.$emit('change-tunnel-direction', this.direction, this.tunnelLength);
            } else {
                if(changeDirection !== otherDirection){
                    this._setTunnelId();
                    this.$emit('change-tunnel-direction', this.direction, this.tunnelLength, this.id);
                } else {
                    this.sweetbox.fire("Another tunnel from the same base point exists in the direction you want to change. Please reset it.");
                }
            }
        },
        handleChangeLength(e) {
            let blastList = this.$store.getters.getTunnel(this.id).blast_list,
                blastingLength = 0;
            this._.forEach(blastList, blastData => {
                blastingLength += blastData.blast_info.blasting_length
            });
            if (parseFloat(blastingLength) > parseFloat(e.target.value)) {
                this.sweetbox.fire("The length you are trying to change is shorter than the total length of blasting. Please reset it.");
            } else {
                this.tunnelLength = parseFloat(e.target.value);
                this.$emit('change-tunnel-length', this.tunnelLength, this.direction);
            }
        },
        handleChangeName(e) {
            this.tunnelName = e.target.value;
            this.section = this.tunnelName;
            this._setTunnelId();
        },
        handleChangeName2(e) {
            this.tunnelName2 = e.target.value;
            this.part = this.tunnelName2;
            this._setTunnelId();
        },
    },
    computed: {
        getDirectionList() {
            if (this.category == 100) {
                return this.thList;
            } else {
                return this.bhList;
            }
        },
        getSection() {
            if (!this.section) {
                this.section = this.tunnelInfo.section;
            }
            return this.section;
        },
        getPart() {
            if (!this.part) {
                this.part = this.tunnelInfo.part;
            }
            return this.part;
        },
        getItemName() {
            return `${ this.tunnelInfo.tunnel_id }`;
        },
        getCategory() {
            if (!this.category) {
                this.category = this.tunnelInfo.category;
            }
            return this.category;
        },
        getDirection() {
            if (!this.direction) {
                this.direction = this.tunnelInfo.direction;
            }
            return this.direction;
        },
        getTunnelId() {
            if (!!this.totalTunnelName) {
                this.tunnelId = this.totalTunnelName + this._getCategoryName(this.category) + this._getDirectionName(this.direction);
            } else {
                this.totalTunnelName = this.section + this.part;
                this.tunnelId = this.tunnelInfo.tunnel_id;
            }
            return this.tunnelId;
        },
        getTunnelLength() {
            if (!this.tunnelLength) {
                this.tunnelLength = this.tunnelInfo.length.toFixed(1);
            }
            return this.tunnelLength;
        },
        getLength() {
            let curLength = this.tunnelInfo.b_accum_length,
            totalLength = this.tunnelInfo.length,
            percent = (curLength / totalLength) * 100;
            return curLength.toFixed(1) + "m / " + totalLength.toFixed(1) + "m ( " + percent.toFixed(1) + " % )";
        },
        getStartTime() {
            let t = this.tunnelInfo.initial_b_time.substring(0, 16);
            t = t.replace("T", ". ");
            t = t.replace("-", ". ");
            t = t.replace("-", ". ");
            return t;
        },
        getTotalTime() {
            let totalTime = 0,
                tmpTime = new Date(0);
            this._.forEach(this.tunnelInfo.blast_list, blast => {
                totalTime += blast.accum_time;
                this._setCycleMin(blast);
                this._setCycleMax(blast);
            });
            tmpTime.setSeconds(totalTime);
            this.totalTimestamp = totalTime;
            // return tmpTime.toISOString().substr(11,8);
            let tList = tmpTime.toISOString().substr(9,7).split('T');
            let day = parseInt(tList[0]) - 1;
            let tStr = tList[1].split(":");
            let h = tStr[0] + 'H';
            let m = tStr[1] + "M";
            return day + "D" + " " + h + " " + m;
        },
        getBlastingNo() {
            return this.tunnelInfo.blast_list.length + ' Nos';
        },
        getBlastingEff() {
            let ret = parseFloat((this.tunnelInfo.b_accum_length / this.tunnelInfo.blast_list.length).toFixed(1));
            if (!ret) {
                ret = 0;
            }
            return ret + "m/Blast";
        },
        getCycleMax() {
            let ret = parseFloat(((this.cycleMax / 3600) / this.tunnelInfo.blast_list.length).toFixed(1));
            if (!ret || ret == Infinity) {
                ret = 0;
            }
            return 'Max ' + ret + 'Hr/Blast';
        },
        getCycleMin() {
            let ret = parseFloat(((this.cycleMin / 3600) / this.tunnelInfo.blast_list.length).toFixed(1));
            if (!ret || ret == Infinity) {
                ret = 0;
            }
            return 'Min ' + ret + 'Hr/Blast';
        },
        getCycleAvg() {
            let ret = parseFloat(((this.totalTimestamp / 3600) / this.tunnelInfo.blast_list.length).toFixed(1));
            if (!ret) {
                ret = 0;
            }
            return 'Avg ' + ret + 'Hr/Blast';
        },
        getProductivityMax() {
            let ret = parseFloat((this.bLengthMax / (this.cycleMax / 86400)).toFixed(1));
            if (!ret) {
                ret = 0;
            }
            return 'Max ' + ret + 'm/Day';
        },
        getProductivityMin() {
            let ret = parseFloat((this.bLengthMin / (this.cycleMin / 86400)).toFixed(1));
            if (!ret) {
                ret = 0;
            }
            return 'Min ' + ret + 'm/Day';
        },
        getProductivityAvg() {
            let ret = parseFloat((this.tunnelInfo.b_accum_length / (this.totalTimestamp / 86400)).toFixed(1));
            if (!ret) {
                ret = 0;
            }
            return 'Avg ' + ret + 'm/Day';
        },
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
    background-color: #39B2FF;
    color: #ffffff;
    cursor: default;
    border-radius: 10px 0 0 10px!important;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
}
.tunnel-info-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.tunnel-info-body-container {
    width: 100%;
    height: 90%;
    padding: 1em;
    overflow-y: scroll;
}
.tunnel-info-body-container.edit {
    width: 100%;
    height: 75%;
    padding: 1em;
    overflow-y: none;
}
.tunnel-info-body-content-container {
    font-size: 1.4em;
}
.tunnel-info-body-content-container.fold {
    text-align: right;
    margin-bottom: 6px;
}
.tunnel-info-body-content-container.line {
    border-bottom: 2px solid #fefefe;
    margin-bottom: 10px;
}
.tunnel-info-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.tunnel-info-body-content-title.fold {
    width: 35%;
    font-size: 13px;
    text-align: left;
}
.tunnel-info-body-content-message {
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
.tunnel-info-body-content-message.fold {
    width: 60%;
    font-size: 13px;
    padding-left: 14px;
}
.tunnel-info-body-content-message.sub {
    margin-left: 30%;
    margin-bottom: 0.7em;
}
.tunnel-info-body-button-container {
    text-align: center;
}
.tunnel-info-body-button-edit {
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
.tunnel-info-body-button-remove {
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
.tunnel-info-body-blast-container {
    text-align: center;
}
.tunnel-info-body-blast-list-container {
    border: 1px solid;
    width: 100%;
    height: 5em;
}
.tunnel-info-body-blast-button-container {
}
.tunnel-info-body-blast-button-add {
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
.tunnel-info-button-container {
    width: 100%;
    height: 5%;
    text-align: center;
}
.tunnel-info-button-container.edit {
    height: 15%;
}
.tunnel-info-ok-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
}
.tunnel-info-cancle-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #fffff1;
    color: #1b94e2;
    box-shadow: 2px 2px;
}
.tunnel-info-close-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 5em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #fffff1;
    color: #1b94e2;
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
.tunnel-info-progress-detail-container {
    width: 100%;
    height: 2em;
    text-align: center;
}
.detail-title-container {
    width: 100%;
    height: 100%;
    margin: 5px;
    padding: 2px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #eef0fa;
    color: #1b94e2;
    text-align: center
}
.detail-title {
    display: inline-block;
    width: 90%;
}
.detail-container {
    padding: 4px;
}
.detail-container.close {
    display: none;
}
.button-image.position {
    position: unset;
    display: inline-block;
    width: 15px;
    height: 15px;
    background-color: white;
    background-image: url('../assets/imgs/up-arrow.png');
}
.button-image.down {
    background-image: url('../assets/imgs/down-arrow.png');
}

</style>