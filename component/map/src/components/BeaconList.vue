<template>
    <div v-if="getShowStatus" id="beaconList" class="beaconListContainer">
        <div class="beaconListTitleContainer">
            <div class="BeaconListTdFirstContainer">Kind
            </div>
            <div class="BeaconListTdContainer">AT1
            </div>
            <div class="BeaconListTdContainer">AT2
            </div>
            <div class="BeaconListTdContainer">Other
            </div>
            <div class="BeaconListTdContainer">Total
            </div>
        </div>
        <div class="beaconListContentContainer">
            <BeaconListItem v-for="typeId in typeRange" :key="typeId" :id="typeId"
            :beaconDataObj="getBeaconData">
            </BeaconListItem>
        </div>
        <div class="beaconListBottomContainer">
            <div class="BeaconListTdFirstContainer">Total
            </div>
            <div class="BeaconListTdContainer">{{ getTotalAt1 }}
            </div>
            <div class="BeaconListTdContainer">{{ getTotalAt2 }}
            </div>
            <div class="BeaconListTdContainer">{{ getTotalOther }}
            </div>
            <div class="BeaconListTdContainer">{{ getTotal }}
            </div>
        </div>
    </div>
</template>
<script>
import BeaconListItem from '@/components/BeaconListItem';
import { EventBus } from '@/main.js';
export default {
    name: 'BeaconList',
    components: {
        BeaconListItem
    },
    props: {
        isShow: {
            type: Boolean
        },
        showBeaconData: {
            type: Object
        },
        typeRange: {
            type: Array,
            default: [
                '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
                '11', '12', '13', '14', '15', '16', '17', '18', '19'
            ]
        }
    },
    data() {
        return {
        }
    },
    computed: {
        getShowStatus() {
            return this.isShow;
        },
        getBeaconData() {
            return this.showBeaconData;
        },
        getTypeRange() {
            return this.typeRange;
        },
        getTotalAt1() {
            var number = 0;
            this._.forEach(this.getTypeRange, (kind) => {
                number += this.getBeaconData['at1'][kind].length;
            });
            return number;
        },
        getTotalAt2() {
            var number = 0;
            this._.forEach(this.getTypeRange, (kind) => {
                number += this.getBeaconData['at2'][kind].length;
            });
            return number;
        },
        getTotalOther() {
            var number = 0;
            this._.forEach(this.getTypeRange, (kind) => {
                number += this.getBeaconData['other'][kind].length;
            });
            return number;
        },
        getTotal() {
            return this.getTotalAt1 + this.getTotalAt2 + this.getTotalOther;
        },
    },
    methods: {
    },
    created() {
    }
}
</script>
<style>
.beaconListContainer {
    position:absolute;
    left: 72%;
    top: %;
    z-index: 4;
    width: 370px;
    background: rgb(85, 185, 250);
    opacity: 0.9;
    text-align: center;
    font-weight: bolder;
    border-radius: 8px;
    font-size: 12px;
    color: #333333;
    -webkit-box-shadow: 11px 11px 20px #aaaaaa99;
    box-shadow: 11px 11px 20px #aaaaaa99;
}

.BeaconListTdFirstContainer {
    display: inline-block;
    width: 140px;
    padding: 5px;
}
.BeaconListTdContainer {
    display: inline-block;
    width: 40px;
    padding: 5px;
}

.beaconListTitleContainer {
    border-bottom: 1px solid #555555;
    padding-top: 5px;
}
.beaconListContentContainer {
    background: rgb(80, 155, 220);
}

.beaconListBottomContainer {
}

</style>