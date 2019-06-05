import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        hubs: {},
        gadgets: {},
        detectedgadgets: {},
        forInfohubs: [],
        drawnHubs: {}
    },
    getters: {
        getHubs: (state) => {
            return _.values(state.hubs);
        },
        getHub: (state) => (hid) => {
            if (!_.isEmpty(state.hubs[hid])) {
                return state.hubs[hid];
            } else {
                console.warn(`Theres no hub data in hubid ${hid}`);
            }
        },
        getHubsWhichIsInMap: (state) => {
            return _.values(state.drawnHubs);
        },
        getBeaconWithHubs: (state) => (hid) => {
            if (!_.isEmpty(state.forInfohubs[hid])) {
                return state.forInfohubs[hid];
            } else {
                console.warn(`Theres no hub data in hubid ${hid}`);
            }
        },
        getdetectedGadgetList: (state) => {
            return state.detectedgadgets;
        },
        getdetectedGadgetName: (state) => (detectedGadgetId) => {
            if (!!state.detectedgadgets[detectedGadgetId]) {
                return state.detectedgadgets[detectedGadgetId].name;
            } else {
                return "";
            }
        }
    },
    mutations: {
        addHubs(state, payload) {
            _.forEach(payload, hub => {
                state.hubs[hub.id] = hub;
            });
        },
        HubIsInMap(state, payload) {
            if (_.isEmpty(state.drawnHubs[payload])) {
                state.drawnHubs[payload] = {};
            }
            state.drawnHubs[payload].id = payload;
            state.drawnHubs[payload].view = 1;
        },
        HubIsNotInMap(state, payload) {
            if (_.isEmpty(state.drawnHubs[payload])) {
                state.drawnHubs[payload] = {};
            }
            state.drawnHubs[payload].id = payload;
            state.drawnHubs[payload].view = 0;
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
                            hubIdList: [],
                            name: data.name,
                            dist: detectedGadget.dist,
                            uuid: data.beacon_spec.uuid,
                            major: data.beacon_spec.major,
                            minor: data.beacon_spec.minor,
                            custom: {},
                            tags: data.tags,
                            view: 0,
                            account_id: data.account_id
                        }
                    }

                    state.forInfohubs[detectedGadget.hid] = payload;
                    if (_.isEmpty(state.detectedgadgets[detectedGadget.gid].hubIdList.find((hid) => hid === detectedGadget.hid))) {
                        state.detectedgadgets[detectedGadget.gid].hubIdList.push(detectedGadget.hid);
                    }
                }
            })
        },
        addHubLocation(state, payload) {
            let hubList = state.hubs[payload.id];
            if (!_.isEmpty(hubList)) {
                hubList.custom.map_location = payload.custom.map_location;
            }
        },
        addGadgetLocation(state, payload) {
            let gadgetList = state.gadgets[payload.gid],
                  detectedGadgetList = state.detectedgadgets[payload.gid];
            if (!_.isEmpty(gadgetList) && !_.isUndefined(detectedGadgetList)) {
                gadgetList.custom = _.pick(payload, ['x', 'y']);
                detectedGadgetList.custom = _.pick(payload, ['x', 'y']);
            }
        },
        GadgetIsInMap(state, payload) {
            if (state.detectedgadgets[payload]) {
                state.detectedgadgets[payload].view = window.CONSTANTS.HUB_VIEW.IN_MAP;
            }
        },
        GadgetIsnotInMap(state, payload) {
            if (!_.isEmpty(state.detectedgadgets[payload])) {
                state.detectedgadgets[payload].view = window.CONSTANTS.HUB_VIEW.NOT_IN_MAP;
            }
        },
        removeGadgets(state) {
            _.forEach(state.gadgets, (gadget, gid) => {
                state.gadgets[gid] = {};
                Vue.delete(state.gadgets, gid);
            });
            _.forEach(state.detectedgadgets, (gadget, gid) => {
                state.detectedgadgets[gid] = {};
                Vue.delete(state.detectedgadgets, gid);
            });
        },
        removeHubs(state) {
            _.forEach(state.forInfohubs, (gadgets, hid) => {
                state.forInfohubs[hid] = {};
                Vue.delete(state.forInfohubs, hid);
            })
        }
    }
})
