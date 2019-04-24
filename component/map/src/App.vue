<template>
<div id="locationTracking">
  <Upload></Upload>
  <Map @select-button="handleSelectedButton"></Map>
</div>
</template>
<script>
import Map from '@/components/map';
import Upload from '@/components/upload';
export default {
  components: {
    Map,
    Upload
  },
  methods: {
    handleSelectedButton() {
      //TODO: remove
    }
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
