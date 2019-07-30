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
		hubListDetectOneGadget: {},
		gadgetListDetectedByOneHub: {}
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
						view: 0,
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
						if (index < 2 || Math.abs(beforeDetectedGadget.dist - detectedGadget.dist) > 0.1) {
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
				state.gadgets[payload.id] = payload
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
		GadgetIsInMap(state, payload) {
			if (state.detectedgadgets[payload]) {
				state.detectedgadgets[payload].view = window.CONSTANTS.HUB_VIEW.IN_MAP
			}
		},
		GadgetIsnotInMap(state, payload) {
			if (!_.isEmpty(state.detectedgadgets[payload])) {
				state.detectedgadgets[payload].view = window.CONSTANTS.HUB_VIEW.NOT_IN_MAP
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
		}
	}
})
