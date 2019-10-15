import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        speakers: {},
        groupList: {},
        alarmList: {},
        reserveAlarmList: {},
        streamingStatus: false
    },
    getters: {
        getSpeakers: (state) => {
			return _.values(state.speakers)
		},
		getSpeaker: (state) => (id) => {
			return state.speakers[id];
		},
        getAlarmList: (state) => {
			return _.values(state.alarmList)
        },
        getReserveAlarmList: (state) => {
			return _.values(state.reserveAlarmList)
        },
        // TODO: id? or name?
        getReserveAlarmData: (state) => (id) => {
        	return state.reserveAlarmList[id];
        },
        getAlarmData: (state) => (id) => {
        	return state.alarmList[id];
        },
        getGroupList: (state) => {
            return _.values(state.groupList);
        },
        getGroup: (state) => (id) => {
            return state.groupList[id];
        },
        getStreamingStatus: (state) => {
            return state.streamingStatus;
        }
    },
    mutations: {
        addSpeakers(state, payload) {
            _.forEach(payload, speaker => {
                state.speakers[speaker.id] = speaker
            });
        },
        addSpeaker(state, payload) {
            state.speakers[payload.id] = payload
        },
        removeSpeaker(state, id) {
            if (_.has(state.speakers, id)) {
                delete state.speakers[id];
            }
        },
        removeSpeakers(state) {
            _.forEach(state.speakers, (speaker, id) => {
                delete state.speakers[id];
            });
            state.speakers = {};
        },
        updateSpeaker(state, payload) {
            if (_.has(state.speakers, payload.id)) {
                state.speakers[payload.id] = payload
            }
        },
        addAlarmList(state, payload) {
            _.forEach(payload, data => {
                state.alarmList[data.id] = data;
            });
        },
        addAlarmData(state, payload) {
            state.alarmList[payload.id] = payload;
        },
        removeAlarmList(state) {
            _.forEach(state.alarmList, (data, id) => {
                delete state.alarmList[id];
            });
            state.alarmList = {};
        },
        removeAlarmData(state, id) {
            if (_.has(state.alarmList, id)) {
                delete state.alarmList[id];
            }
        },
        addReserveAlarmList(state, payload) {
            _.forEach(payload, data => {
                state.reserveAlarmList[data.id] = data;
            });
        },
        addReserveAlarmData(state, payload) {
            state.reserveAlarmList[payload.id] = payload;
        },
        removeReserveAlarmList(state) {
            _.forEach(state.reserveAlarmList, (data, id) => {
                delete state.reserveAlarmList[id];
            });
            state.reserveAlarmList = {};
        },
        removeReserveAlarmData(state, id) {
            if (_.has(state.reserveAlarmList, id)) {
                delete state.reserveAlarmList[id];
            }
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
        updateStreamingStatus(state, status) {
            state.streamingStatus = status
        },
    },
    actions: {

    }
})
