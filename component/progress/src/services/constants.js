window.CONSTANTS = {
    IS_DEV: true,
    URL: {
        CONSOLE: '',
        BASE_IMG: 'static/imgs/',
        TEST_URL: 'http://127.0.0.1:5561',
    },
    TOP_BUTTON_TYPE: {
        PLUS: 'plus',
        MINUS: 'minus',
        FILTER: 'filter',
        WINDOW: 'window',
    },
    EVENT_TYPE: {
        ADDED: 'add',
        UPDATED: 'update',
        REMOVED: 'remove',
        UPDATE_TUNNEL_LIST: 'update_tunnel_list',
        UPDATE_PROG_LIST: 'update_prog_list'
    },
    REQUEST_TYPE: {
        SUBSCRIBE: "subscribe",
        UNSUBSCRIBE: "unsubscribe"
    },
    CONTEXT_MENU_TYPE: {
        SET: 'set',
        CHANGE: 'change',
        REMOVE: 'remove'
    },
    TUNNEL_DEFAULT_SIZE: {
        CAVERN: {
            WIDTH: 140,
            HEIGHT: 18
        },
        WATER_CURTAIN: {
            WIDTH: 10,
            HEIGHT: 6
        },
        MAINLOAD: {
        }
    },
    ADD_TYPE: {
        TUNNEL: 0,
        PROGRESS: 1,
        WORK: 2
    },
    TUNNEL_TYPE: {
        CAVERN: 0,
        WATER_CURTAIN: 1,
        MAIN_ROAD: 2
    },
    TUNNEL_DIRECTION_TYPE: {
        ROW: 0,
        COLUMN: 1
    },
    PROG_DIR: {
        RIGHT: 0,
        LEFT: 1,
        UP: 2,
        down: 3,
    }
};
if (window.CONSTANTS.IS_DEV) {
    //window.CONSTANTS.URL.CONSOLE = 'http://192.168.0.15:5000';
    window.CONSTANTS.URL.CONSOLE = 'http://127.0.0.1:5000';
}
