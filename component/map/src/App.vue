<template>
<div id="locationTracking">
  <div v-show="isLoaded" class="loading"><div class="main-loader"><div></div><div></div><div></div><div></div></div></div>
  <Top></Top>
  <Map @map-load="handleMapLoad"></Map>
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
  data() {
    return {
      isLoaded: false
    }
  },
  methods: {
    handleMapLoad(isLoaded) {
      this.isLoaded = isLoaded;
    }
  }
}
</script>
<style>
#locationTracking {
  height: 100%;
  width: 100%;
  /*------------ This CSS are required when npm run build -----------*/
  position: relative;
}

.loading {
  width: 100%;
  position: fixed;
  background-color: white;
  height: 100%;
  z-index: 3;
  opacity: 0.7;
   /*------------ This CSS are required when npm run build -----------*/
  position: relative;
}

.main-loader {
  display: inline-block;
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  opacity: 1;
  z-index: 4;
}
.main-loader div {
  position: absolute;
  top: 27px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: black;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.main-loader div:nth-child(1) {
  left: 6px;
  animation: loader1 0.6s infinite;
}
.main-loader div:nth-child(2) {
  left: 6px;
  animation: loader2 0.6s infinite;
}
.main-loader div:nth-child(3) {
  left: 26px;
  animation: loader2 0.6s infinite;
}
.main-loader div:nth-child(4) {
  left: 45px;
  animation: loader3 0.6s infinite;
}
@keyframes main-loader1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes main-loader3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes main-loader2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(19px, 0);
  }
}


@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
