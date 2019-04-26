<template>
<div id="locationTracking">
  <Zoom></Zoom>
  <Upload></Upload>
  <Map></Map>
</div>
</template>
<script>
import Map from '@/components/map';
import Upload from '@/components/upload';
import Zoom from '@/components/zoom';
export default {
  components: {
    Map,
    Upload,
    Zoom
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
