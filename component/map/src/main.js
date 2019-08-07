import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueLodash from 'vue-lodash'
import 'maptalks/dist/maptalks.css'
import store from './store';
import sweetalert from 'sweetalert2';
import '@/services/constant.js';
import * as services from '@/services/services.js';

Vue.prototype.$http = axios;
Vue.prototype.services = services;
Vue.prototype.sweetbox = sweetalert;
Vue.config.productionTip = false;

export const EventBus = new Vue({});

Vue.use(VueLodash);
new Vue({
    store,
    render: h => h(App)
}).$mount('#locationTracking')
