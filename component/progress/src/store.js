import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
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
        getTunnelListByBasePointId : (state, getters) => (basePointId) => {
            let tunnelList = getters.getTunnelList,
                ret = [];
            _.forEach(tunnelList, tunnelData => {
                if (tunnelData.basepoint_id == basePointId) {
                    ret.push(tunnelData);
                }
            });
            return ret;
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
    actions: {

    }
})
