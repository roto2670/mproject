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
		routers: {},
		hubListDetectOneGadget: {},
		gadgetListDetectedByOneHub: {},
		speaker: {},
		ipcamIdAttachedOnBeacon: {},
		alarms: {},
		groupList: {},
		streamingStatus: false,
		nowPlaying: 0,
        basePoint: {},
        tunnel: {},
        blast: {},
        blastInfo: {},
        work: {},
        pause: {},
        operator: {},
        equipment: {},
        message: {},
        team: {},
        charging: {},
        blasting: {},
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
		},
		getStreamingStatus: (state) => {
			return state.streamingStatus;
        },
            getNowPlaying: (state) => {
            return state.nowPlaying;
        },
		getRouters: (state) => {
			return _.values(state.routers);
		},
		getRouter: (state) => (id) => {
			return state.routers[id];
		},
		getBasePoint: (state) => (id) => {
            return state.basePoint[id];
        },
        getBasePointList: (state) => {
			return _.values(state.basePoint);
        },
        getTunnel: (state) => (id) => {
            return state.tunnel[id];
        },
        getTunnelList: (state) => {
			return _.values(state.tunnel);
        },
        getBlast: (state) => (id) => {
            return state.blast[id];
        },
        getBlastList: (state) => {
			return _.values(state.blast);
        },
        getBlastInfo: (state) => (id) => {
            return state.blastInfo[id];
        },
        getBlastInfoList: (state) => {
            return _.values(state.blastInfo);
        },
        getWork: (state) => (id) => {
            return state.work[id];
        },
        getWorkList: (state) => {
            return _.values(state.work);
        },
        getPause: (state) => (id) => {
            return state.pause[id];
        },
        getPauseList: (state) => {
            return _.values(state.pause);
        },
        getOperator: (state) => (id) => {
            return state.operator[id];
        },
        getOperatorList: (state) => () => {
			return _.values(state.operator);
        },
        getEquipment: (state) => (id) => {
            return state.equipment[id];
        },
        getEquipmentList: (state) => () => {
			return _.values(state.equipment);
        },
        getMessage: (state) => (id) => {
            return state.message[id];
        },
        getMessageList: (state) => () => {
			return _.values(state.message);
        },
        getTeam: (state) => (id) => {
            return state.team[id];
        },
        getTeamList: (state) => () => {
			return _.values(state.team);
        },
        getCharging: (state) => (work_id) => {
            return state.charging[work_id];
        },
        getBlasting: (state) => (work_id) => {
            return state.blasting[work_id];
        },
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
						// hubList = _.reverse(hubList);
						hubList = hubList.reverse();
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
		updateStreamingStatus(state, status) {
			state.streamingStatus = status
        },
        updateNowPlaying(state, playStatus) {
            state.nowPlaying = playStatus
        },
		// Duplicate
		// updateSpeakerData(state, payload) {
		// 	if (!!state.speakers[payload.id]) {
		// 		state.speakers[payload.id] = payload;
		// 	}
		// },
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
		},
		addRouter(state, payload) {
			state.routers[payload.id] = payload;
		},
		removeRouter(state, id) {
			delete state.routers[id];
		},
		updateRouterData(state, payload) {
			if (_.has(state.routers, payload.id)) {
				_.extend(state.routers[payload.id], payload);
			}
		},
		addBasePointList(state, payload) {
           _.forEach(payload, basePoint => {
              state.basePoint[basePoint.id] = basePoint;
           });
        },
        addBasePoint(state, payload) {
            state.basePoint[payload.id] = payload;
        },
        removeBasePoint(state, id) {
            if (_.has(state.basePoint, id)) {
                delete state.basePoint[id];
            }
        },
        removeBasePointList(state) {
            _.forEach(state.basePoint, (basePoint, id) => {
                delete state.basePoint[id]
            })
            state.basePoint = {};
        },
        updateBasePoint(state, payload) {
            if (_.has(state.basePoint, payload.id)) {
                state.basePoint[payload.id] = payload;
            }
        },
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
        addBlastList(state, payload) {
            _.forEach(payload, blast => {
                state.blast[blast.id] =blast
            });
        },
        addBlast(state, payload) {
            state.blast[payload.id] = payload;
        },
        removeBlast(state, id) {
            if (_.has(state.blast, id)) {
                delete state.blast[id];
            }
        },
        removeBlastList(state) {
            _.forEach(state.blast, (blast, id) => {
                delete state.blast[id];
            })
            state.blast = {};
        },
        updateBlast(state, payload) {
            if (_.has(state.blast, payload.id)) {
                state.blast[payload.id] = payload;
            }
        },
        addBlastList(state, payload) {
            _.forEach(payload, blast => {
                state.blast[blast.id] =blast
            });
        },
        addBlastInfo(state, payload) {
            state.blastInfo[payload.id] = payload;
        },
        removeBlastInfo(state, id) {
            if (_.has(state.blastInfo, id)) {
                delete state.blastInfo[id];
            }
        },
        removeBlastInfoList(state) {
            _.forEach(state.blastInfo, (blastInfo, id) => {
                delete state.blastInfo[id];
            })
            state.blast = {};
        },
        updateBlastInfo(state, payload) {
            if (_.has(state.blastInfo, payload.id)) {
                state.blastInfo[payload.id] = payload;
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
        updateWork(state, payload) {
            if (_.has(state.work, payload.id)) {
                state.work[payload.id] = payload;
            }
        },
        addPause(state, payload) {
            state.pause[payload.id] = payload;
        },
        removePause(state, id) {
            if (_.has(state.pause, id)) {
                delete state.pause[id];
            }
        },
        removePauseList(state) {
            _.forEach(state.pause, (pause, id) => {
                delete state.pause[id]
            })
            state.pause = {};
        },
        updatePause(state, payload) {
            if (_.has(state.pause, payload.id)) {
                state.pause[payload.id] = payload;
            }
        },
        addOperator(state, payload) {
            state.operator[payload.id] = payload;
        },
        addOperatorList(state, payload) {
            _.forEach(payload, operator => {
                state.operator[operator.id] = operator;
            });
        },
        removeOperator(state, id) {
            if (_.has(state.operator, id)) {
                delete state.operator[id];
            }
        },
        removeOperatorList(state) {
            _.forEach(state.operator, (operator, id) => {
                delete state.operator[id]
            })
            state.operator = {};
        },
        updateOperator(state, payload) {
            if (_.has(state.operator, payload.id)) {
                state.operator[payload.id] = payload;
            }
        },
        addEquipment(state, payload) {
            state.equipment[payload.id] = payload;
        },
        addEquipmentList(state, payload) {
            _.forEach(payload, equipment => {
                state.equipment[equipment.id] = equipment;
            });
        },
        removeEquipment(state, id) {
            if (_.has(state.equipment, id)) {
                delete state.equipment[id];
            }
        },
        removeEquipmentList(state) {
            _.forEach(state.equipment, (equipment, id) => {
                delete state.equipment[id]
            })
            state.equipment = {};
        },
        updateEquipment(state, payload) {
            if (_.has(state.equipment, payload.id)) {
                state.equipment[payload.id] = payload;
            }
        },
        addMessage(state, payload) {
            state.message[payload.id] = payload;
        },
        addMessageList(state, payload) {
            _.forEach(payload, message => {
                state.message[message.id] = message;
            });
        },
        removeMessage(state, id) {
            if (_.has(state.message, id)) {
                delete state.message[id];
            }
        },
        removeMessageList(state) {
            _.forEach(state.message, (message, id) => {
                delete state.message[id]
            })
            state.message = {};
        },
        updateMessage(state, payload) {
            if (_.has(state.message, payload.id)) {
                state.message[payload.id] = payload;
            }
        },
        addTeam(state, payload) {
            state.team[payload.id] = payload;
        },
        addTeamList(state, payload) {
            _.forEach(payload, team => {
                state.team[team.id] = team;
            });
        },
        removeTeam(state, id) {
            if (_.has(state.team, id)) {
                delete state.team[id];
            }
        },
        removeTeamList(state) {
            _.forEach(state.team, (team, id) => {
                delete state.team[id]
            })
            state.message = {};
        },
        updateTeam(state, payload) {
            if (_.has(state.team, payload.id)) {
                state.team[payload.id] = payload;
            }
        },
        addCharging(state, payload) {
            state.charging[payload.work_id] = payload;
        },
        addChargingList(state, payload) {
            _.forEach(payload, charging => {
                state.charging[charging.work_id] = charging;
            });
        },
        removeCharging(state, work_id) {
            if (_.has(state.charging, work_id)) {
                delete state.charging[work_id];
            }
        },
        removeChargingList(state) {
            _.forEach(state.charging, (charging, work_id) => {
                delete state.charging[work_id];
            })
            state.message = {};
        },
        updateCharging(state, payload) {
            if (_.has(state.charging, payload.work_id)) {
                state.charging[payload.work_id] = payload;
            }
        },
        addBlasting(state, payload) {
            state.blasting[payload.work_id] = payload;
        },
        addBlastingList(state, payload) {
            _.forEach(payload, blasting => {
                state.blasting[blasting.work_id] = blasting;
            });
        },
        removeBlasting(state, work_id) {
            if (_.has(state.blasting, work_id)) {
                delete state.blasting[work_id];
            }
        },
        removeBlastingList(state) {
            _.forEach(state.blasting, (blasting, work_id) => {
                delete state.blasting[work_id];
            })
            state.message = {};
        },
        updateBlasting(state, payload) {
            if (_.has(state.blasting, payload.work_id)) {
                state.blasting[payload.work_id] = payload;
            }
        },
	},
})
