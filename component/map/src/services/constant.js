window.CONSTANTS = {
    IS_DEV: false,
    IS_MOCK: false,
    HUB_VIEW : {
        NOT_IN_MAP : 0,
        IN_MAP : 1
    },
    URL : {
        BASE_IMG: 'static/location/imgs/',
        YOUR_CLOUD : 'https://c2.prota.space',
        CONSOLE : '',
        TEST_URL: 'http://192.168.1.176:5561',
        WEB_SOCKET: '',
        PA: 'http://172.16.5.6:5561'
    },
    HUB_INFO: {
        0: "Portal",
        1: "AT1",
        2: "AT2"
    },
    GADGET_INFO: {
        1: "Jumbo Drill(2B)",
        2: "Jumbo Drill(3B)",
        3: "Charging Car",
        4: "Wheel Loader",
        5: "Dump Truck",
        6: "Excavator(Wheel)",
        7: "Excavator(Crawler)",
        8: "Shotcrete Machine",
        9: "JCB",
        10: "Core Drilling Machine",
        11: "Dozer",
        12: "Grouting Rig",
        13: "Mai Pump",
        14: "MPU(Mobile Production Unit)",
        15: "CPU(Charging Pump Unit)",
        16: "Bus",
        17: "WCBH Drilling Machine",
        18: "Explosive Van",
        19: "Concrete Mixer Truck"
    },
    MINIMUM_NUMBER : {
        HUB : 1,
        FILTERED_BEACONS : 16
    },
    CONTEXT_TYPE: {
        SCANNER: 0,
        IPCAM: 1,
        SPEAKER: 2,
        ROUTER: 3
    },
    USER_STAGE: {
        SK_ADMIN: 0,
        SK_NORMAL: 1,
        SK_HQ: 3,
        ADNOC_SITE: 4,
        ADNOC_HQ: 5,
        MOI: 6
    },
    REQUEST_TYPE: {
        SUBSCRIBE: "subscribe",
        UNSUBSCRIBE: "unsubscribe",
        GET_INFO: "get_info",
        GET_MAP_FILE: "get_map_file",
        SET_MAP_FILE: "set_map_file",
        GET_DATA: "get_data",
        UPDATE_DATA: "update_data",
        GET_DETECTED_LIST: "get_detected_list",
        OPEN_STREAM: "open_stream",
        CLOSE_STREAM: "close_stream",
        GET_ALARM_LIST: "get_alarm_list",
        SET_ALARM: "set_alarm"
    },
    EVENT_TYPE: {
        ADDED: "added",
        UPDATED: "updated",
        REMOVED: "removed",
        GET_DETECTED_LIST: "detected",
        ONLINE: "on",
        OFFLINE: "off",
        REFRESH: "refresh",
        REOPEN_STREAM: 'reopen_stream',
        UPDATE_ALARM_LIST: 'update_alarm_list',
        UPDATE_GROUP_LIST: 'update_group_list',
        UPDATE_STREAMING_STATUS: 'update_streaming_status',
        FAILED_LIST : 'failed_list'
    },
    PLAY_STATUS: {
        READY_FOR_STREAM: 0,
        MY_STREAM: 1,
        OTHER_STREAM: 2
    },
    PRODUCT_KIND: {
        HUB: "hub",
        IPCAM: "ipcam",
        BEACON: "beacon",
        MIBSSKEC: "mibsskec",
        SPEAKER: "speaker",
        ROUTER: "router"
    },
    MICROPHONE_ACCESS_STATE: {
        ALREADY_GRANT: 'granted',
        NEED_REQUIRED: 'prompt',
        DENIED: 'denied'
    },
    BEACON_DISTANCE_OFFSET: 5,
    STREAMING_ERROR_CODE: {
        IPCAM_DISCONNECT: 1,
        STREAMING_FAILED: 2,
        STREAMING_SERVER_DISCONNECT: 3,
        LIMIT_STREAMING_ACCESS: 4,
        UNKNOWN_IPCAMID: 5
    },
    HUB_FILTER_TEXT: {
        AT1: "AT1",
        AT2: "AT2",
        PORTAL: "Portal"
    },
    IPCAM_FILTER_TEXT: {
        FIXED: "Fixed",
        MOBILE: "Mobile"
    },
    RECORD_TEXT: {id:"record"}
};
if (window.CONSTANTS.IS_DEV) {
    window.CONSTANTS.URL.CONSOLE = 'http://127.0.0.1:5000';
    window.CONSTANTS.URL.WEB_SOCKET = '127.0.0.1';
    window.CONSTANTS.URL.PA = 'http://127.0.0.1:5561';
}
