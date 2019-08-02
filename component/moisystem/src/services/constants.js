window.CONSTANTS = {
    IS_DEV: false,
    INTERVAL: {
        WEBSOCKET_CONNECTION: 10 * 1000
    },
    BUTTON_TYPE: {
        LIST: 0,
        PARTITION: 1
    },
    MAX_SHOWING_SCREEN: 4,
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
    }
}