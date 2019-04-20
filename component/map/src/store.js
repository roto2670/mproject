import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    hubs: {}
  },
  getters: {
    getScannerList: function(data, id) {
      var returnObject = [];
      for (var key in data) {
        if (key === id) {
          returnObject[key] = data[key];
        }
      }
      return returnObject;
    },
    getHub: (state) => (id) => {
      return state.hubs[id];
    }
  },
  mutations: {
    addHubs(state, payload) {
      payload.forEach(hub => {
        state.hubs[hub.id] = hub;
      });
    }
  },
  actions: {

  }
})
