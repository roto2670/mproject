window.CONSTANTS = {
    IS_DEV: true,
    INTERVAL: {
        WEBSOCKET_CONNECTION: 10 * 1000
    },
    BUTTON_TYPE: {
        LIST: 0
        // PARTITION: 1
    },
    MAX_SHOWING_SCREEN: 9,
    REQUEST_TYPE: {
        SUBSCRIBE: 'subscribe',
        UNSUBSCRIBE: 'unsubscribe',
        GET_INFO: 'get_info',
        GET_MAP_FILE: 'get_map_file',
        SET_MAP_FILE: 'set_map_file',
        GET_DATA: 'get_data',
        UPDATE_DATA: 'update_data',
        GET_DETECTED_LIST: 'get_detected_list',
        OPEN_STREAMING: 'open_stream',
        CLOSE_STREAMING: 'close_stream'
    },
    EVENT_TYPE: {
        ADDED: 'added',
        UPDATED: 'updated',
        REMOVED: 'removed',
        GET_DETECTED_LIST: 'detected',
        HUB_ONLINE: 'on',
        HUB_OFFLINE: 'off',
        REFRESH: 'refresh',
        REOPEN_STREAMING: "reopen_stream"
    },
    STREAMING_ERROR_CODE: {
        IPCAM_DISCONNECT: 1,
        STREAMING_FAILED: 2,
        STREAMING_SERVER_DISCONNECT: 3,
        LIMIT_STREAMING_ACCESS: 4
    },
    URL: {
        CONSOLE: ''
    },
    TIMEOUT_SEC: 15 * 1000
};
if (window.CONSTANTS.IS_DEV) {
    window.CONSTANTS.URL.CONSOLE = 'http://127.0.0.1:5000';
    // window.CONSTANTS.URL.CONSOLE = 'http://192.168.0.15:5000';
}