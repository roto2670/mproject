window.CONSTANTS = {
    IS_DEV: true,
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
        PA: 'http://172.16.5.6:5561',
        DEFUALT_IMG: {
            MAIN: 'main/default_main.svg',
            SUPPORTING: 'support/default_supporting.svg',
            IDLE: 'idle/default_idle.svg',
        },
        MAIN: {
        },
        SUPPORTING: {
        },
        IDLE: {
        },
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
        19: "Concrete Mixer Truck",
        20: "Shuttle",
        21: "Worker"
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
        FAILED_LIST : 'failed_list',
        UPDATE_BASEPOINT_LIST: 'update_basepoint_list',
        UPDATE_TUNNEL_LIST: 'update_tunnel_list',
        UPDATE_BLAST_LIST: 'update_blast_list',
        UPDATE_BLAST_INFO_LIST: 'update_blast_info_list',
        UPDATE_WORK_LIST: 'update_work_list',
        UPDATE_WORK_HISTORY_LIST: 'update_work_history_list',
        UPDATE_PAUSE_HISTORY_LIST: 'update_pause_history_list',
        UPDATE_WORK_EQUIPMENT_LIST: 'update_work_equipment_list',
        UPDATE_MESSAGE_LIST: 'update_message_list',
        UPDATE_TEAM_LIST: 'update_team_list',
        UPDATE_ACTIVITY_LIST: 'update_activity_list',
        UPDATE_CHARGING_LIST: 'update_charging_list',
        UPDATE_BLASTING_LIST: 'update_blasting_list'
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
        NEW_BEACON: "mibs00001",
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
    RECORD_TEXT: {id:"record"},
    TUNNEL_DEFAULT_SIZE: {
        CAVERN_ROW: {
            WIDTH: 140,
            HEIGHT: 15
        },
        BASEPOINT: {
            WIDTH: 8,
            HEIGHT:15
        },
        BLAST: {
            WIDTH: 10
        }
    },
    TYPE: {
        ADD_BASEPOINT: 1,
        ADD_TUNNEL: 2,
        ADD_BLAST: 3,
        ADD_WORK: 4,
        SELECT_BASEPOINT: 11,
        SELECT_CAVERN: 21,
        SELECT_BLAST: 31,
        SELECT_BLAST_INFORMATION: 32,
        SELECT_WORK: 41,
    },
    TUNNEL_TYPE: {  // Color
        BASEPOINT: 0,
        CAVERN: 1,
        BLAST: 3,
        FINISH_BLAST: 4,
        TH: 100,
        B1: 101,
        B2: 102,
        FINISH_TH: 1000,
        FINISH_B1: 1001,
        FINISH_B2: 1002,
    },
    TUNNEL_CATEGORY: {  // Color , AddTunnel.vue(11 Line)
        TH: 100,
        B1: 101,
        B2: 102
    },
    TUNNEL_DIRECTION_TYPE: {
        ROW: 0,
        COLUMN: 1
    },
    DIRECTION: {
        EAST: 0,
        WEST: 1,
        EAST_SIDE_EAST: 2,
        EAST_SIDE_WEST: 3,
        WEST_SIDE_EAST: 4,
        WEST_SIDE_WEST: 5
    },
    CATEGORY: {
        MAIN_WORK: 0,
        SUPPORTING: 1,
        IDEL_TIME: 2
    },
    CATEGORY_NAME: {
        0: "MAIN WORK",
        1: "SUPPORTING",
        2: "IDEL_TIME"
    },
    WORK_NAME: {
    },
    WORK_STATE: {
        STOP: 0,
        IN_PROGRESS: 1,
        FINISH: 2
    },
    WORK_STATE_NAME: {
        0: "Not Started",
        1: "In Progress",
        2: "Completed"
    },
    BLAST_STATE: {
        IN_PROGRESS: 1,
        FINISH: 2,
    },
};
if (window.CONSTANTS.IS_DEV) {
    window.CONSTANTS.URL.CONSOLE = 'http://127.0.0.1:5000';
    window.CONSTANTS.URL.WEB_SOCKET = '127.0.0.1';
    window.CONSTANTS.URL.PA = 'http://127.0.0.1:5561';
}
