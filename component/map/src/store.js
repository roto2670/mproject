import Vue from 'vue'
import Vuex from 'vuex'
import { stat } from 'fs'
import { strictEqual } from 'assert'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		hubs: {},
		gadgets: {},
		detectedgadgets: {},
		ipcams: {},
		speakers: {},
		hubListDetectOneGadget: {},
		gadgetListDetectedByOneHub: {},
		speaker: {},
		ipcamIdAttachedOnBeacon: {},
		alarms: {},
		groupList: {}
	},
	getters: {
		getHubs: (state) => {
			return _.values(state.hubs)
		},
		getHub: (state) => (hid) => {
			if (!_.isEmpty(state.hubs[hid])) {
				return state.hubs[hid]
			} else {
				return {}
			}
		},
		getdetectedGadgetList: (state) => {
			return state.detectedgadgets
		},
		getDetectedGadget: (state) => (gid) => {
			if (!_.isEmpty(state.detectedgadgets[gid])) {
				return state.detectedgadgets[gid]
			} else {
				console.warn(`Theres no detected gadget data in gadget id ${gid}`)
			}
		},
		getGadget: (state) => (gid) => {
			if (!_.isEmpty(state.gadgets[gid])) {
				return state.gadgets[gid]
			} else {
				console.warn(`Theres no gadget data in gadget id ${gid}`)
			}
		},
		getdetectedGadgetName: (state) => (detectedGadgetId) => {
			if (!!state.detectedgadgets[detectedGadgetId]) {
				return state.detectedgadgets[detectedGadgetId].name
			} else {
				return {}
			}
		},
		getIpCams: (state) => {
			return _.values(state.ipcams)
		},
		getIpCam: (state) => (ipcamId) => {
			if (!!state.ipcams[ipcamId]) {
				return state.ipcams[ipcamId]
			} else {
				console.warn(`Theres no ipcam data in ipcam id ${ipcamId}`)
			}
		},
		getHubListDetectOneGadget: (state) => (gid) => { // 가젯을 발견한 허브 목록
			if (!!state.hubListDetectOneGadget[gid]) {
				return state.hubListDetectOneGadget[gid]
			}
			return {}
		},
		getGadgetListDetectedByOneHub: (state) => (hid) => { // 허브에 발견된 가젯 목록
			if (!!state.gadgetListDetectedByOneHub[hid]) {
				return state.gadgetListDetectedByOneHub[hid]
			}
			return {}
		},
		getIpcamIdAttachedOnBeacon: (state) => (ipcamId) => {
			if (!!state.ipcamIdAttachedOnBeacon[ipcamId])  {
				return state.ipcamIdAttachedOnBeacon[ipcamId];
			}
			return {}
		},
		getSpeakers: (state) => {
			return _.values(state.speakers);
		},
		getSpeaker: (state) => (id) => {
			return state.speakers[id];
		},
		getAlarmList: (state) => (id) => {
			return state.alarms[id];
		},
		getAlarms: (state) => {
			return state.alarms;
		},
		getGroupList: (state) => {
            return _.values(state.groupList);
        },
        getGroup: (state) => (id) => {
            return state.groupList[id];
        }
	},
	mutations: {
		addHub(state, payload) {
			if (!!!state.hubs[payload.id]) {
				state.hubs[payload.id] = payload
			}
		},
		addGadgets(state, payload) {
			_.forEach(payload, bcn => {
				if (_.isString(bcn.custom) || !!!bcn.custom) {
					bcn.custom = {}
				}
			
				state.gadgets[bcn.id] = bcn
			})
		},
		addGadget(state, bcn) {
			if (_.isString(bcn.custom) || !!!bcn.custom) {
				bcn.custom = {}
			}
			state.gadgets[bcn.id] = bcn
		},
		addDetectedHubGadget(state, detectedGadget) {
			if (_.has(state.gadgets, detectedGadget.gid)) {
				let data = state.gadgets[detectedGadget.gid]
				if (_.isEmpty(state.detectedgadgets[detectedGadget.gid])) {
					state.detectedgadgets[detectedGadget.gid] = {
						gid: data.id,
						hubIdList: [],
						name: data.name,
						custom: _.isObject(data.custom) ? data.custom : {},
						tags: data.tags,
						account_id: data.account_id,
						_t : new Date() / 1000
					}
				}
				
				if (_.isEmpty(state.detectedgadgets[detectedGadget.gid].hubIdList.find((hid) => hid === detectedGadget.hid))) {
					state.detectedgadgets[detectedGadget.gid].hubIdList.push(detectedGadget.hid)
				}
				if (!_.has(state.hubListDetectOneGadget, detectedGadget.gid)) {
					state.hubListDetectOneGadget[detectedGadget.gid] = {}
				}
				if (_.has(state.hubListDetectOneGadget[detectedGadget.gid], detectedGadget.hid)) {
					let beforeDetectedGadget = state.hubListDetectOneGadget[detectedGadget.gid][detectedGadget.hid];
					if (detectedGadget._t > beforeDetectedGadget._t) {
						let hubList = _.sortBy(state.hubListDetectOneGadget[detectedGadget.gid], ['_t']),
							index = -1; 
						hubList = _.reverse(hubList); 
						hubList = _.values(hubList);
						index = _.findIndex(hubList, (item) => {
							return item.hid === detectedGadget.hid;
						})
						if (index < 2 || Math.abs(beforeDetectedGadget.dist - detectedGadget.dist) > window.CONSTANTS.BEACON_DISTANCE_OFFSET) {
							state.hubListDetectOneGadget[detectedGadget.gid][detectedGadget.hid] = detectedGadget;
						}
					}
				} else {
					state.hubListDetectOneGadget[detectedGadget.gid][detectedGadget.hid] = detectedGadget
				}
	
				if (!_.has(state.gadgetListDetectedByOneHub, detectedGadget.hid)) {
					state.gadgetListDetectedByOneHub[detectedGadget.hid] = {}
				}
	
				if (_.has(state.gadgetListDetectedByOneHub[detectedGadget.hid], detectedGadget.gid)) {
					if (detectedGadget._t > state.gadgetListDetectedByOneHub[detectedGadget.hid][detectedGadget.gid]._t) {
						state.gadgetListDetectedByOneHub[detectedGadget.hid][detectedGadget.gid] = detectedGadget
					}
				} else {
					state.gadgetListDetectedByOneHub[detectedGadget.hid][detectedGadget.gid] = detectedGadget
				}
			}		
		},
		addIpcamIdAttachedOnBeacon(state, data) {
			if (!state.ipcamIdAttachedOnBeacon[data.ipcamId]) {
				state.ipcamIdAttachedOnBeacon[data.ipcamId] = data.gid;
			}
		},
		updateIpcamIdAttachedOnBeacon(state, data) {
			if (!!state.ipcamIdAttachedOnBeacon[data.ipcamId]) {
				state.ipcamIdAttachedOnBeacon[data.ipcamId] = data.gid;
			}
		},
		removeIpcamIdAttachedOnBeacon(state, ipcamId) {
			if (!!state.ipcamIdAttachedOnBeacon[ipcamId]) {
				delete state.ipcamIdAttachedOnBeacon[ipcamId];
			}
		},
		updateHubData(state, payload) {
			if (!!state.hubs[payload.id]) {
				state.hubs[payload.id] = payload
			}
		},
		updateGadgetMoiData(state, payload) {
			if (!!state.detectedgadgets[payload.id]) {
				state.detectedgadgets[payload.id].custom.is_visible_moi = payload.isVisible
				state.gadgets[payload.id].custom.is_visible_moi = payload.isVisible
			}
		},
		updateGadgetData(state, payload) {
			if (!!state.gadgets[payload.id]) {
				_.extend(state.gadgets[payload.id], payload);
			}
			if (!!state.detectedgadgets[payload.id]) {
				_.extend(state.detectedgadgets[payload.id], payload);
			}
		},
		updateSpeakerData(state, payload) {
			if (!!state.speakers[payload.id]) {
				state.speakers[payload.id] = payload;
			}
		},
		removeGadgetLocation(state, gid) {
			if (!!state.detectedgadgets[gid] && !!state.gadgets[gid]) {
				state.detectedgadgets[gid].custom.map_location = {}
				state.gadgets[gid].custom.map_location = {}
			}
		},
		addGadgetLocation(state, payload) {
			let gadget = state.gadgets[payload.gid],
				detectedGadget = state.detectedgadgets[payload.gid]
			if (!!gadget && !!detectedGadget) {
				gadget.custom.map_location = _.pick(payload, ['x', 'y'])
				detectedGadget.custom.map_location = _.pick(payload, ['x', 'y'])
			}
		},
		removeGadget(state, gid) {
			delete state.gadgets[gid];
			delete state.hubListDetectOneGadget[gid];

			_.forEach(state.gadgetListDetectedByOneHub, (gadgetList, hid) => {
				_.forEach(gadgetList, (data, gadgetId) => {
					if (gadgetId === gid) {
						delete gadgetList[gadgetId]
					}
				})
			})
		},
		removeDetectedGadgetWithHub(state, payload) {
			delete state.gadgetListDetectedByOneHub[payload.hid][payload.gid];
			delete state.hubListDetectOneGadget[payload.gid][payload.hid];
			if (!!state.detectedgadgets[payload.gid]) {
				state.detectedgadgets[payload.gid].hubIdList = _.without(state.detectedgadgets[payload.gid].hubIdList, payload.hid);
			}
		},
		removeHub(state, payload) {
			state.hubs[payload] = {};
			Vue.delete(state.hubs, payload);
		},
		removeIpcam(state, ipcamId) {
			state.ipcams[ipcamId] = {};
			Vue.delete(state.ipcams, ipcamId);
		},
		addIpcams(state, payload) {
			_.forEach(payload, (ipcam) => {
				state.ipcams[ipcam.id] = ipcam;
			})
		},
		addIpcam(state, payload) {
			state.ipcams[payload.id] = payload;
		},
		updateIpcamData(state, payload) {
			if (!!state.ipcams[payload.id]) {
				state.ipcams[payload.id] = payload;
			}
		},
		addSpeaker(state, payload) {
			state.speakers[payload.id] = payload;
		},
		removeSpeaker(state, id) {
			delete state.speakers[id];
		},
		updateSpeakerData(state, payload) {
			if (_.has(state.speakers, payload.id)) {
				_.extend(state.speakers[payload.id], payload);
			}
		},
		addAlarms(state, payload) {
			state.alarms[payload.id] = payload;
		},
		removeAlarms(state, payload) {
			if (_.has(state.alarms, payload)) {
				delete state.alarms[payload];
			}
		},
		updateAlarms(state, payload) {
			state.alarms[payload.id] = payload.data;
		},
		addGroup(state, payload) {
            if (!_.has(state.groupList, payload.id)) {
                state.groupList[payload.id] = payload;
            }
        },
        removeGroup(state, id) {
            if (_.has(state.groupList, id)) {
                delete state.groupList[id];
            }
        },
        updateGroup(state, payload) {
            if (_.has(state.groupList, payload.id)) {
                state.groupList[payload.id] = payload;
            }
        }
	}
})
