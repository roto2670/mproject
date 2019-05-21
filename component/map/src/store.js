import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        hubs: {},
        gadgets: {},
        detectedgadgets: {},
        forInfohubs: [],
        drawgadget: {}
    },
    getters: {
        getHubs: (state) => {
            return _.values(state.hubs);
        },
        getHub: (state) => (id) => {
            return state.hubs[id];
        },
        getBeaconWithHubs: (state) => (hid) => {
            return state.forInfohubs[hid];
        },
        getGadget: (state) => (hid, gid) => {
            return state.gadgets[hid].find((gadget) => gadget.id === gid);
        },
        getGadgetsWithHub: (state) => {
            return state.gadgets; 
        },
        getdetectedGadgetList: (state) => {
            return state.detectedgadgets;
        },
        getdetectedGadgetName: (state) => (detectedGadgetId) => {
            return state.detectedgadgets[detectedGadgetId].name
        },
        getgadgetmanyhubs: (state) => {
            let returnObject = {};
            _.forEach(state.detectedgadgets, (detectedGadget) => {
                returnObject[detectedGadget.gid] = {};
                returnObject[detectedGadget.gid] = detectedGadget.hid;
            })
            return returnObject;
        }
    },
    mutations: {
        addHubs(state, payload) {
            _.forEach(payload, hub => {
                state.hubs[hub.id] = hub; 
            });
        },
        addHub(state, payload) {
            if (_.isEmpty(state.hubs[payload.hub_id])) {
                state.hubs[payload.hub_id] = [];
            }
            state.hubs[payload.hub_id].push(payload.hub);
        },
        addDetectedGadget(state, payload) {
            _.forEach(payload, bcn => {
                state.gadgets[bcn.id] = bcn;
            })
        },
        addDetectedHubGadget(state, payload) {
            _.forEach(payload, detectedGadget => {
                if (_.has(state.gadgets, detectedGadget.gid)) {
                    let data = state.gadgets[detectedGadget.gid];
                    if (_.isEmpty(state.detectedgadgets[detectedGadget.gid])) {
                        state.detectedgadgets[detectedGadget.gid] = {
                            gid: data.id,
                            hid: [],
                            name: data.name,
                            dist: detectedGadget.dist,
                            uuid: data.beacon_spec.uuid,
                            major: data.beacon_spec.major,
                            minor: data.beacon_spec.minor,
                            custom: {},
                            tags: data.tags,
                            view: 0
                        }
                    }
                    
                    state.forInfohubs[detectedGadget.hid] = payload;
                    if (_.isEmpty(state.detectedgadgets[detectedGadget.gid].hid.find((id) => id === detectedGadget.hid))) {
                        state.detectedgadgets[detectedGadget.gid].hid.push(detectedGadget.hid);
                    }
                }
            })
            console.log("detectedGadgets", state.detectedgadgets);
        },
        addGadgets(state, payload) {
            _.forEach(payload, gadget => {
                state.gadgets[gadget.id] = gadget;
            });
        },
        addHubLocation(state, payload) {
            const hubList = state.hubs[payload.id];
            if (!_.isEmpty(hubList)) {
                hubList.custom.map_location = payload.custom.map_location;
            }
        },
        addGadgetLocation(state, payload) {
            const gadgetList = state.gadgets[payload.gid],
                  detectedgadgetList = state.detectedgadgets[payload.gid];
            if (!_.isEmpty(gadgetList)) {
                gadgetList.custom = _.pick(payload, ['x', 'y']);
                detectedgadgetList.custom = _.pick(payload, ['x', 'y']);
            } else {
                console.warn(`GadgetList is Empty`);
            }
        },
        GadgetIsInMap(state, payload) {
            if (state.detectedgadgets[payload]) {
                state.detectedgadgets[payload].view = 1;
            }
        },
        GadgetIsnotInMap(state, payload) {
            if (!_.isEmpty(state.detectedgadgets[payload])) {
                state.detectedgadgets[payload].view = 0;
            } 
        },
        removeGadgets(state) {
            state.gadgets = {};
        }
    },
    actions: {
        
    }
})
