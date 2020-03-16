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
        SELECT_WATER_CURTAIN: 12,
        SELECT_PROGRESS: 21,
        SELECT_WORK: 31,
    },
    TUNNEL_TYPE: {
        CAVERN: 0,
        WATER_CURTAIN: 1,
        MAIN_ROAD: 2,
        PROGRESS: 3,
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
    MAIN_WORK: {
        BLASTING: 100,
        VENTILATION: 101,
        MUCKING_1: 102,
        MECHANICAL_SCALING: 103,
        MENUAL_SCALING: 104,
        MUCKING_2: 105,
        GEO_MAPPING: 106,
        WATER_SPRAY: 107,
        SHOTCRETE: 108,
        PROBHOLES: 109,
        BOTTOM_CLEANING: 110,
        FACE_DRILLING: 111,
    },
    SUPPORTING_WORK: {
        SHOTCRETE: 200,
        ROCK_BOLT_MARKING: 201,
        ROCK_BOLT_DRILLING: 202,
        ROCK_BOLT_INJECTION: 203,
        DRILLING_FOR_GROUTING: 204,
        GROUTING: 205,
        GROUTING_CURING: 206,
        GROUTING_CHECK_HOLES: 207,
        CORE_DRILLING: 208,
    },
    IDEL_TIME: {
        TBM: 300,
        INTERFERENCE: 301,
        EVACUATION: 302,
        EQUIPMENT_BREAKEDOWN: 303,
        NO_WORK: 304,
        PREPERATION: 305,
        RESOURCE_NOT_AVAILABLE: 306,
        SHIFT_CHANGE: 307,
        EXPLOSIVE_DELIVERY: 308,
        OTHERS: 309,
        NONE: 310,
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
