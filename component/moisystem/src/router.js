import Vue from 'vue'
import Router from 'vue-router'
import Main from './views/Main.vue'
Vue.use(Router)

export default new Router({
  base: process.env.BASE_URL,
  mode: 'history'
  // routes: [
  //   {
  //     path: '/',
  //     name: 'main',
  //     component: Main,
  //     children: []
  //   }
  // ]
})
