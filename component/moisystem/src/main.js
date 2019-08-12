import VueLodash from 'vue-lodash';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/services/constants';
import * as services from '@/services/services.js';
import sweetalert from 'sweetalert2';

Vue.config.productionTip = false
Vue.prototype.sweetbox = sweetalert;
Vue.prototype.services = services;
export const EventBus = new Vue({});
Vue.use(VueLodash);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
