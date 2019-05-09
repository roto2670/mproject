import Vue from 'vue'
import Vuex from 'vuex'

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
        getHubs: (state) => {
            return _.values(state.hubs);
        },
        getHub: (state) => (id) => {
            return state.hubs[id];
        },
        getGadget: (state) => (hid, gid) => {
            console.log("stategadget", state.gadgets);
            return state.gadgets[hid].find((gadget) => gadget.id === gid);
        },
        getGadgets: (state) => (hid) => {
            return state.gadgets[hid];
        },
        hasGadget: (state) => (hid, gid) => {
            return !!state.gadgets[hid] &&
                   !!state.gadgets[hid].find((gadget) => gadget.id === gid);
        }
    },
    mutations: {
        addHubs(state, payload) {
            _.forEach(payload, hub => {
                state.hubs[hub.id] = hub;
            });
        },
        addHub(state, payload) {
            if (!!_.isEmpty(state.hubs[payload.hub_id])) {
                state.hubs[payload.hub_id] = [];
            }
            state.hubs[payload.hub_id].push(payload.hub);
        },
        addGadget(state, payload) {
            if (!!!state.gadgets[payload.hub_id]) {
                state.gadgets[payload.hub_id] = [];
            }
            state.gadgets[payload.hub_id].push(payload.gadget);
        },
        addGadgets(state, payload) {
            _.forEach(payload, gadget => {
                state.gadgets[gadget.gid] = gadget;
            });
        },
        addGadgetLocation(state, payload) {
            const gadgetList = state.gadgets[payload.hid];
            console.log("ttqq", gadgetList);
            console.log("stategadget", state.gadgets);
            if (!_.isEmpty(gadgetList)) {
                let gadget = _.find(gadgetList, (gadget) => gadget.id === "822c5303bcb71f54e891e5c493537aae"); // TODO: Test Code
                console.log("gadgetg", gadget);
                if (!_.isObject(gadget.custom)) {
                    gadget.custom = {};
                } else {
                    console.warn(`Gadgets custom is empty ins gadget id: ${gadget.gid}`);
                }
                gadget.custom.map_location = _.pick(payload, ['x', 'y']);
            } else {
                console.warn(`GadgetList is Empty`);
            }
            // state.gadgets[gadget.custom.map_location] = payload;
        },
        removeGadgets(state) {
            state.gadgets = {};
        }
    },
    actions: {
        //비동기 함수만 사용, dispatch사용
    }
})
