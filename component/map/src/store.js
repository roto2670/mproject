import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    hubs: []
  },
  getters: {
    getScannerList: function(state) {
      var list = []
      state.hubs.forEach(function(hub) {
        var object = {}
        object.id = hub.id;
        object.beacons = hub.beacons;
        list.push(object);
      })
      return list;
    }
  },
  mutations: {
    addHubs(state, payload) {
      state.hubs.concat(payload);
    }
  },
  actions: {

  }
})
