window.CONSTANTS = {
    IS_DEV: false,
    URL: {
        CONSOLE: '',
        BASE_IMG: 'static/imgs/',
        TEST_URL: 'http://127.0.0.1:5561'
    },
    TOP_BUTTON_TYPE: {
        PLUS: 'plus',
        MINUS: 'minus',
        FILTER: 'filter',
        SOUND_SET_UP: 'sound_set_up',
        GROUP_SET_UP: 'group_set_up',
        BROADCAST: 'broadcast',
        SCHEDULED_BROADCAST: 'scheduled_broadcast'
    },
    EVENT_TYPE: {
        ADDED: 'added',
        UPDATED: 'updated',
        REMOVED: 'removed',
        UPDATE_ALARM_LIST: 'update_alarm_list',
        UPDATE_GROUP_LIST: 'update_group_list'
    },
    REQUEST_TYPE: {
        SUBSCRIBE: "subscribe",
        UNSUBSCRIBE: "unsubscribe",
        GET_DATA: "get_data",
        UPDATE_DATA: "update_data",
        GET_ALARM_LIST: 'get_alarm_list',
        SET_ALARM_LIST: 'set_alarm_list'
    },
    CONTEXT_MENU_TYPE: {
        SET: 'set',
        CHANGE: 'change',
        REMOVE: 'remove'
    },
    MICROPHONE_ACCESS_STATE: {
        ALREADY_GRANT: 'granted',
        NEED_REQUIRED: 'prompt',
        DENIED: 'denied'
    },
    LIST_TYPE: {
        SOUND: 0,
        SPEAKER: 1
    },
    RESERVE_TYPE: {
        SCHEDULED_BROADCAST: 'scheduled',
        GROUP: 'group',
        SOUND: 'sound',
        RESERVE_TIME: 'reserve_time'
    }
};
if (window.CONSTANTS.IS_DEV) {
    window.CONSTANTS.URL.CONSOLE = 'http://127.0.0.1:5000';
    window.CONSTANTS.URL.PA = 'http://127.0.0.1:5561';
    // window.CONSTANTS.URL.CONSOLE = 'http://192.168.0.15:5555';
}