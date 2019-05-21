import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueLodash from 'vue-lodash'
import 'maptalks/dist/maptalks.css'
import store from './store'
import * as services from '@/services/services.js';
import * as beaconDetector from '@/services/beacon-detector.js';

Vue.prototype.$http = axios;
Vue.prototype.services = services;
Vue.prototype.beaconDetector = beaconDetector;
Vue.prototype.BASE_URI = '';
Vue.config.productionTip = false;

export const EventBus = new Vue({});

Vue.use(VueLodash);
new Vue({
  store,
  render: h => h(App)
}).$mount('#locationTracking')
