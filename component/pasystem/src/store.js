import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        speakers: {},
        groupList: {},
        alarmList: {}
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
        // TODO: id? or name?
        getAlarmData: (state) => (id) => {
        	return state.alarmList[id];
        },
        getGroupList: (state) => {
            return _.values(state.groupList);
        },
        getGroup: (state) => (id) => {
            return state.groupList[id];
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
    },
    actions: {

    }
})
