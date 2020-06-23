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
            _.forEach(state.equipment, (operator, id) => {
                delete state.equipment[id]
            })
            state.equipment = {};
        },
        updateEquipment(state, payload) {
            if (_.has(state.equipment, payload.id)) {
                state.equipment[payload.id] = payload;
            }
        },
    },
    actions: {

    }
})
