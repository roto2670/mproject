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
        UPDATE_PROG_LIST: 'update_prog_list',
        UPDATE_WORK_LIST: 'update_work_list'
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
        CAVERN_ROW: {
            WIDTH: 140,
            HEIGHT: 18
        },
        CAVERN_COLUMN: {
            WIDTH: 8,
            HEIGHT: 36
        },
        WATER_CURTAIN_ROW: {
            WIDTH: 140,
            HEIGHT: 6
        },
        WATER_CURTAIN_COLUMN: {
            WIDTH: 140,
            HEIGHT: 6
        },
        MAINLOAD: {
        }
    },
    TYPE: {
        ADD_TUNNEL: 0,
        ADD_PROGRESS: 1,
        ADD_WORK: 2,
        SELECT_CAVERN: 11,
        SELECT_WATER_CURTAIN: 12
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
        DOWN: 3,
    },
    WORK_KIND: {
        EXAMPLE_KIND_0 : 0,
        EXAMPLE_KIND_1 : 1,
        EXAMPLE_KIND_2 : 2,
        EXAMPLE_KIND_3 : 3,
        EXAMPLE_KIND_4 : 4,
        EXAMPLE_KIND_5 : 5,
    },
    WORK_STATE: {
        READY: 0,
        START: 1,
        STOP: 2,
        FINISH: 3
    }
};
if (window.CONSTANTS.IS_DEV) {
    //window.CONSTANTS.URL.CONSOLE = 'http://192.168.0.15:5000';
    window.CONSTANTS.URL.CONSOLE = 'http://127.0.0.1:5000';
}
