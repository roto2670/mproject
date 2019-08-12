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
        CONSOLE : ''
    },
    HUB_INFO: {
        0: "Portal",
        1: "AT1",
        2: "AT2"
    },
    GADGET_INFO: {
        1: "JUMBO DRILL(2B)",
        2: "JUMBO DRILL(3B)",
        3: "CHARGING CAR",
        4: "WHEEL LOADER",
        5: "DUMP TRUCK",
        6: "EXCAVATOR(WHEEL)",
        7: "EXCAVATOR(CRAWLER)",
        8: "SHOTCRETE MACHINE",
        9: "JCB",
        10: "CORE DRILLING MACHINE",
        11: "DOZER",
        12: "GROUTING MACHINE",
        13: "MAI PUMP",
        14: "MOBILE PRODUCTION UNIT",
        15: "CHARGING PUMP UNIT",
        16: "BUS",
        17: "WCBH DRILLING MACHINE",
        18: "Explosive Van",
        19: "Concrete Mixer Truck"
    },
    MINIMUM_NUMBER : {
        HUB : 1,
        FILTERED_BEACONS : 16
    },
    CONTEXT_TYPE: {
        SCANNER: 0,
        IPCAM: 1
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
        CLOSE_STREAM: "close_stream"
    },
    EVENT_TYPE: {
        ADDED: "added",
        UPDATED: "updated",
        REMOVED: "removed",
        GET_DETECTED_LIST: "detected",
        HUB_ONLINE: "on",
        HUB_OFFLINE: "off",
        REFRESH: "refresh",
        REOPEN_STREAM: 'reopen_stream'
    },
    PRODUCT_KIND: {
        HUB: "hub",
        IPCAM: "ipcam",
        BEACON: "beacon",
        MIBSSKEC: "mibsskec"
    },
    BEACON_DISTANCE_OFFSET: 5,
    STREAMING_ERROR_CODE: {
        IPCAM_DISCONNECT: 1,
        STREAMING_FAILED: 2,
        STREAMING_SERVER_DISCONNECT: 3,
        LIMIT_STREAMING_ACCESS: 4
    }
};
if (window.CONSTANTS.IS_DEV) {
    window.CONSTANTS.URL.CONSOLE = 'http://127.0.0.1:5000';
    // window.CONSTANTS.URL.CONSOLE = 'http://192.168.0.15:5000';
}