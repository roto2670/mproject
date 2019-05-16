<template>
<div id="locationTracking">
  <Zoom></Zoom>
  <!-- <BeaconFilter></BeaconFilter> -->
  <Upload></Upload>
  <Map></Map>
</div>
</template>
<script>
import Map from '@/components/map';
// import BeaconFilter from '@/components/beacon-filter';
import Upload from '@/components/upload';
import Zoom from '@/components/zoom';
export default {
  components: {
    Map,
    Upload,
    Zoom,
    // BeaconFilter
  },
  methods: {

  }
}
</script>
<style>
#locationTracking {
  margin: 0px;
  height: 100%;
  width: 100%;
  position: absolute;
}

</style>
