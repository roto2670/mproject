import Vue from 'vue'
import App from './App.vue'
import Map from './components/map'
import axios from 'axios'
import 'maptalks/dist/maptalks.css'
import store from './store'
import * as services from '@/services/services.js';
import * as beaconDetector from '@/services/beacon-detector.js';

Vue.prototype.$http = axios;
Vue.prototype.services = services;
Vue.prototype.beaconDetector = beaconDetector;
Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#locationTracking')
