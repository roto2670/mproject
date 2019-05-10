import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        hubs: {},
        gadgets: {},
        detectedgadgets: {}
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
            return state.gadgets[hid].find((gadget) => gadget.id === gid);
        },
        getGadgets: (state) => (hid) => {
            return state.gadgets[hid]; 
        },
        getGadgetList: (state) => (hid) => {
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
        adddetectedGadget(state, payload) {
            var hubId = null;
            _.forEach(payload, hub => {
                // if (!!!state.gadgets['64598ab247e597fcb3cc44839d9ad63c']) {
                //     state.gadgets['64598ab247e597fcb3cc44839d9ad63c'] = [];
                //     state.gadgets['64598ab247e597fcb3cc44839d9ad63c'].push(hub); 
                //     state.detectedgadgets['64598ab247e597fcb3cc44839d9ad63c'] = [];
                //     state.detectedgadgets['64598ab247e597fcb3cc44839d9ad63c'].hid = hub.hid;
                //     state.detectedgadgets['64598ab247e597fcb3cc44839d9ad63c'].gid = hub.gid;
                    
                // }
                if(!!!state.gadgets[hub.hid]) { // TODO: exchange source when data is set. 
                    state.gadgets[hub.hid] = [];
                    state.gadgets[hub.hid].push(hub);
                }
            })
            console.log("stategadget", state.gadgets);
        },
        addGadgets(state, payload) {
            _.forEach(payload, gadget => {
                state.gadgets[gadget.beacon_spec.uuid] = gadget;
            });
        },
        addHubLocation(state, payload) {
            const hubList = state.hubs[payload.id];
            if (!_.isEmpty(hubList)) {
                hubList.custom.map_location = payload.custom.map_location;
            }
        },
        addGadgetLocation(state, payload) {
            _.forEach(payload, gadget => {
                state.gadgets[payload.hid] = gadget;
            });
            // console.log("stategadgList", state.detectedgadgets);
            const gadgetList = state.detectedgadgets[payload.hid];
            if (!_.isEmpty(gadgetList)) {
                let gadget = _.find(gadgetList, (gadget) => gadget.id === payload.gid); // TODO: Test Code
                console.log("gadget", gadget);
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
