import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        tunnel: {},
        progress: {},
        work: {}
    },
    getters: {
        getTunnel: (state) => (id) => {
            return state.tunnel[id];
        },
        getTunnelList: (state) => {
			      return _.values(state.tunnel);
        },
        getProgress: (state) => (id) => {
            return state.progress[id];
        },
        getProgressList: (state) => {
			      return _.values(state.progress);
        },
        getWork: (state) => (id) => {
            return state.work[id];
        },
        getWorkList: (state) => {
			      return _.values(state.work);
        },
    },
    mutations: {
        // TODO:
        addTunnelList(state, payload) {
           _.forEach(payload, tunnel => {
              state.tunnel[tunnel.id] = tunnel;
           });
        },
        addTunnel(state, payload) {
            state.tunnel[payload.id] = payload;
        },
        removeTunnel(state, id) {
            if (_.has(state.tunnel, id)) {
                delete state.tunnel[id];
            }
        },
        removeTunnelList(state) {
            _.forEach(state.tunnel, (tunnel, id) => {
                delete state.tunnel[id]
            })
            state.tunnel = {};
        },
        updateTunnel(state, payload) {
            if (_.has(state.tunnel, payload.id)) {
                state.tunnel[payload.id] = payload;
            }
        },
        addProgressList(state, payload) {
            _.forEach(payload, progress => {
                state.progress[progress.id] = progress;
            });
        },
        addProgress(state, payload) {
            state.progress[payload.id] = payload;
        },
        removeProgress(state, id) {
            if (_.has(state.progress, id)) {
                delete state.progress[id];
            }
        },
        removeProgressList(state) {
            _.forEach(state.progress, (progress, id) => {
                delete state.progress[id];
            })
            state.progress = {};
        },
        updateProgress(state, payload) {
            if (_.has(state.progress, payload.id)) {
                state.progress[payload.id] = payload;
            }
        },
        addWorkList(state, payload) {
            _.forEach(payload, work => {
                state.work[work.id] = work;
            });
        },
        addWork(state, payload) {
            state.work[payload.id] = payload;
        },
        removeWork(state, id) {
            if (_.has(state.work, id)) {
                delete state.work[id];
            }
        },
        removeWorkList(state) {
            _.forEach(state.work, (work, id) => {
                delete state.work[id]
            })
            state.work = {};
        },
    },
    actions: {

    }
})
