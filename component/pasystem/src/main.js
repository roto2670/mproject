import Vue from 'vue'
import VueLodash from 'vue-lodash'
import App from './App.vue'
import router from './router'
import store from './store'
import sweetalert from 'sweetalert2';
import '@/services/constants.js';
import * as services from '@/services/services.js';

Vue.config.productionTip = false
Vue.prototype.services = services;
Vue.prototype.sweetbox = sweetalert;
Vue.use(VueLodash);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
