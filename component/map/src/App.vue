<template>
<div id="App">
  <Map @select-button="handleSelectedButton"></Map>
</div>
</template>
<script>
import Map from '@/components/map';
export default {
  components: {
    Map
  },
  methods: {
    handleSelectedButton() {
      //TODO: remove
    }
  }
}
</script>
<style>
#App {
  margin: 0px;
  height: 100%;
  width: 100%;
  position: absolute;
}

</style>
