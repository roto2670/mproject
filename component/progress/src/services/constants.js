window.CONSTANTS = {
    IS_DEV: true,
    URL: {
        CONSOLE: '',
        BASE_IMG: 'static/imgs/',
        MAIN: {
            101: 'main/ventilation.svg',
            102: 'main/first_mucking.svg',
            103: 'main/mechanical_scaling.svg',
            104: 'main/manual_scaling.svg',
            105: 'main/second_mucking.svg',
            106: 'main/geo_mapping.svg',
            107: 'main/water_spray.svg',
            108: 'main/concrete.svg',
            109: 'main/probhole.svg',
            110: 'main/cleaning.svg',
            111: 'main/face_drilling.svg',
            112: 'main/blasting.svg',
        },
        SUPPORTING: {
            200: 'support/support_concrete.svg',
            201: 'support/rockbolt_marking.svg',
            202: 'support/rockbolt_drilling.svg',
            203: 'support/rockbolt_injection.svg',
            204: 'support/drilling_for_grouting.svg',
            205: 'support/grouting.svg',
            206: 'support/grouting_curing.svg',
            207: 'support/grouting_check_holes.svg',
            208: 'support/core_drilling.svg',
        },
        IDLE: {
            300: 'idle/TBM.svg',
            301: 'idle/interference.svg',
            302: 'idle/evacuation.svg',
            303: 'idle/equipment_breakdown.svg',
            304: 'idle/no_work.svg',
            305: 'idle/preperation.svg',
            306: 'idle/resource_not_available.svg',
            307: 'idle/shift_change.svg',
            308: 'idle/explosive_delivery.svg',
            309: 'idle/others.svg',
            310: 'idle/none.svg',
        },
    },
    TOP_BUTTON_TYPE: {
        PLUS: 'plus',
        MINUS: 'minus',
        // TODO:
        // FILTER: 'filter',
        // WINDOW: 'window',
    },
    EVENT_TYPE: {
        ADDED: 'add',
        UPDATED: 'update',
        REMOVED: 'remove',
        UPDATE_BASEPOINT_LIST: 'update_basepoint_list',
        UPDATE_TUNNEL_LIST: 'update_tunnel_list',
        UPDATE_BLAST_LIST: 'update_blast_list',
        UPDATE_BLAST_INFO_LIST: 'update_blast_info_list',
        UPDATE_WORK_LIST: 'update_work_list',
        UPDATE_WORK_HISTORY_LIST: 'update_work_history_list',
        UPDATE_PAUSE_HISTORY_LIST: 'update_pause_history_list',
        UPDATE_WORK_OPERATOR_LIST: 'update_work_operator_list',
        UPDATE_WORK_EQUIPMENT_LIST: 'update_work_equipment_list'
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
        BASEPOINT: {
            WIDTH: 8,
            HEIGHT:18
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
        WEST: 1
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
    MAIN_WORK: {
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
        BLASTING: 112,
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
    WORK_NAME: {
        101: "VENTILATION",
        102: "FIRST MUCKING",
        103: "MECHANICAL_SCALING",
        104: "MENUAL SCALING",
        105: "SECOND MUCKING",
        106: "GEO MAPPING",
        107: "WATER SPRAY",
        108: "SHOTCRETE",
        109: "PROBHOLES",
        110: "BOTTOM CLEANING",
        111: "FACE DRILLING",
        112: "BLASTING",
        200: "SHOTCRETE",
        201: "ROCK BOLT MARKING",
        202: "ROCK BOLT DRILLING",
        203: "ROCK BOLT INJECTION",
        204: "DRILLING FOR GROUTING",
        205: "GROUTING",
        206: "GROUTING CURING",
        207: "GROUTING CHECK HOLES",
        208: "CORE DRILLING",
        300: "TBM",
        301: "INTERFERENCE",
        302: "EVACUATION",
        303: "EQUIPMENT BREAKEDOWN",
        304: "NO WORK",
        305: "PREPERATION",
        306: "RESOURCE NOT AVAILABLE",
        307: "SHIFT CHANGE",
        308: "EXPLOSIVE_DELIVERY",
        309: "OTHERS",
        310: "NONE",
    },
    WORK_STATE: {
        STOP: 0,
        IN_PROGRESS: 1,
        FINISH: 2
    },
    WORK_STATE_NAME: {
        0: "STOP",
        1: "IN PROGRESS",
        2: "FINISH"
    },
    BLAST_STATE: {
        IN_PROGRESS: 1,
        FINISH: 2,
    },
};
if (window.CONSTANTS.IS_DEV) {
    //window.CONSTANTS.URL.CONSOLE = 'http://192.168.0.15:5000';
    window.CONSTANTS.URL.CONSOLE = 'http://127.0.0.1:5000';
}
