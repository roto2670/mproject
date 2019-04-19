<template>
<div id="App">
  <Map @select-button="handleSelectedButton"></Map>
</div>
</template>
<script>
import Map from '@/components/map';
import Zoom from '@/components/zoom';
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

#map {
  width: 100%;
  height: 100%;
}

#info {
  position: fixed;
  background-color: rgba(13, 13, 13, 0.5);
  padding: 10px 10px 10px 10px;
  font: 13px bold sans-serif;
  color: #fff;
  right: 20px;
  top: 20px;
  width: 100px;
  height: 40px;
  overflow: hidden
}

.hub {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  position: absolute;
  margin-left: 50px;
  margin-top: 15px
}

.maptalks-canvas-layer {
  padding-top: 40px;
}

.menu-content {
  width: 100%;
  background-color: rgb(42 147 240);
  border-radius: 15px;
  overflow: hidden
}

.custom_menu {
  width: 100%;
  color: white;
  background-color: rgb(42 147 240);
  list-style: none;
  padding: 0;
  text-align: center;
  margin-block-end: 0
}

.custom_menu li {
  background: rgb(73 169 243);
  font-size: 13px;
  line-height: 24px;
  width: 200px;
  height: 26px
}

.custom_menu li:hover {
  background: rgb(42 147 240);
  cursor: pointer
}

.custom_menu li+li {
  border-top: 1px solid rgb(42 147 240);
}

.worker_menu {
  width: 100%;
  list-style: none;
  padding: 0;
  text-align: center;
  margin-block-end: 0;
  border-radius: 10px;
  overflow: hidden;
  padding-top: 10px
}

.workerInfo {
  height: 240px;
  width: 250px;
  margin-left: 100px;
  background-color: rgb(42 160 240);
  position: absolute;
  padding-inline-start: 0;
  overflow: scroll;
  overflow-x: hidden
}

.workerId {
  width: 80px;
  height: 80px;
  margin-left: 10px;
  margin-top: 20px;
  color: white;
  text-align: center;
  overflow: hidden;
  font-weight: 900;
  font-size: large
}

.workerCount {
  width: 80px;
  height: 40px;
  margin-left: 10px;
  color: white;
  text-align: center;
  overflow: hidden;
  font-weight: 900;
  font-size: large
}

.workerkey {
  font-weight: 300;
  font-size: small;
}

.workerInfo li {
  background: white;
  opacity: 0.4;
  font-size: 13px;
  line-height: 30px;
  width: 250px;
  height: 30px;
  font-weight: bold;
  list-style-type: none
}

.workerInfo li:hover {
  background: rgb(42 147 240);
  cursor: pointer;
}

::-webkit-scrollbar {
  display: none;
}

.workerInfo li+li {
  border-top: 2px solid rgb(42 147 240)
}

.worker {
  height: 240px;
  width: 100px;
  margin-right: 230px;
  position: absolute;
  background-color: rgb(57 178 255);

}

.bcnskey {
  font-size: x-small
}

.bcnsImg {
  height: 250px;
  width: 300px;
  margin-left: 100px;
}

.bcnsInfo {
  width: 100px;
  height: 250px;
  color: white;
  background-color: rgb(93 224 219);
  padding-top: 50px;
  font-size: large;
  position: absolute;
}

.ipcam_menu {
  width: 100%;
  list-style: none;
  padding: 0;
  text-align: center;
  margin-block-end: 0;
  border-radius: 10px;
  overflow: hidden
}

.ipcam-content {
  height: 200px
}

.ipcam {
  height: 60px;
  background-color: rgb(93 224 219)
}

.exampleimg {
  height: 100%
}
</style>
