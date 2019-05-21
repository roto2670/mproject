<template>
<div id="locationTracking">
  <Top></Top>
  <Map></Map>
</div>
</template>
<script>
import Map from '@/components/map';
import Top from '@/components/top';
export default {
  components: {
    Map,
    Top
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
