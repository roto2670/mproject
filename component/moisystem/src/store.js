import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ipcams: {},
    streamingUrls: {}
  },
  getters: {
    getIpcams(state) {
      return _.values(state.ipcams);
    },
    getIpcam(state) {
      return (id) => {
        return state.ipcams[id];
      }
    },
    isIpcam(state) {
      return (id) => {
        return !!state.ipcams[id];
      }
    },
    getAllStreamingURL(state) {
      return _.values(state.streamingUrls);
    },
    getStreamingURL(state) {
      return (id) => {
        return state.streamingUrls[id] || '';
      }
    }
  },
  mutations: {
    addIpcams(state, payload) {
      _.forEach(payload, (ipcam) => {
        state.ipcams[ipcam.id] = ipcam;
      });
    },
    addIpcam(state, payload) {
      state.ipcams[payload.id] = payload;
    },
    updateIpcam(state, payload) {
      if (_.has(state.ipcams, payload.id)) {
        _.extend(state.ipcams[payload.id], payload);
      }
    },
    removeIpcam(state, id) {
      if (_.has(ipcams, id)) {
        delete state.ipcams[id];
      }
    },
    addStreamingURL(state, payload) {
      _.extend(state.streamingUrls, payload);
      // state.streamingUrls[payload.id] = payload.url;
    },
    removeStreamingURL(state, id) {
      delete state.streamingUrls[id];
    }
  },
  actions: {

  }
});
