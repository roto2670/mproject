<template>
    <div id="beaconListItem" class="beaconListItemContainer">
        <div class="beaconListTdFirstContainer">{{ getKindName }}
        </div>
        <div class="beaconListTdContainer">{{ getAt1Number }}
        </div>
        <div class="beaconListTdContainer">{{ getAt2Number }}
        </div>
        <div class="beaconListTdContainer">{{ getOtherNumber }}
        </div>
        <div class="beaconListTdContainer">{{ getTotalNumber }}
        </div>
    </div>
</template>
<script>
export default {
    name: 'BeaconListItem',
    components: {
    },
    props: {
        id: {
            type: String
        },
        beaconDataObj: {
            type: Object
        }
    },
    data() {
        return {
        }
    },
    computed: {
        getTypeId() {
            return this.id;
        },
        getKindName() {
            return this.beaconDataObj['kind'][this.getTypeId];
        },
        getAt1Number() {
            return this.beaconDataObj['at1'][this.getTypeId].length;
        },
        getAt2Number() {
            return this.beaconDataObj['at2'][this.getTypeId].length;
        },
        getOtherNumber() {
            return this.beaconDataObj['other'][this.getTypeId].length;
        },
        getTotalNumber() {
            return this.getAt1Number + this.getAt2Number + this.getOtherNumber;
        },
    },
    methods: {
    },
    created() {
    }
}
</script>
<style>
.beaconListTdFirstContainer {
    display: inline-block;
    width: 140px;
    padding: 5px;
}
.beaconListTdContainer {
    display: inline-block;
    width: 40px;
    padding: 5px;
}
</style>