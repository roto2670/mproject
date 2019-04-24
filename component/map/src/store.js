import Vue from 'vue'
import Vuex from 'vuex'
import {
    getGadget
} from './services/services';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        hubs: {},
        gadgets: {}
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
        },
        getGadget: (state) => (hid, gid) => {
            return state.gadgets[hid].find((gadget) => gadget.id === gid);
        },
        getGadgets: (state) => (hid) => {
            return state.gadgets[hid];
        }
    },
    mutations: {
        addHubs(state, payload) {
            payload.forEach(hub => {
                state.hubs[hub.id] = hub;
            });
        },
        addGadget(state, payload) {
            if (!!!state.gadgets[payload.hub_id]) {
                state.gadgets[payload.hub_id] = [];
            }
            state.gadgets[payload.hub_id].push(payload.gadget);
        },
        addGadgets(state, payload) {
            payload.forEach(gadget => {
                state.gadgets[gadget.gid] = gadget;
            });
        },
    },
    actions: {

    }
})
