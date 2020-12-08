window.CONSTANTS = {
    IS_DEV: true,
    URL: {
        CONSOLE: '',
        BASE_IMG: 'static/imgs/',
        DEFUALT_IMG: {
            MAIN: 'main/default_main.svg',
            SUPPORTING: 'support/default_supporting.svg',
            IDLE: 'idle/default_idle.svg'
        },
        MAIN: {
        },
        SUPPORTING: {
        },
        IDLE: {
        },
    },
    TOP_BUTTON_TYPE: {
        PLUS: 'plus',
        MINUS: 'minus',
        // TODO:
        // FILTER: 'filter',
        WINDOW: 'window',
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
        UPDATE_WORK_EQUIPMENT_LIST: 'update_work_equipment_list',
        UPDATE_MESSAGE_LIST: 'update_message_list',
        UPDATE_TEAM_LIST: 'update_team_list',
        UPDATE_ACTIVITY_LIST: 'update_activity_list',
        UPDATE_CHARGING_LIST: 'update_charging_list',
        UPDATE_BLASTING_LIST: 'update_blasting_list',
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
            //WIDTH: 140,
            WIDTH: 0.778,
            HEIGHT: 15,
            LOCATION_LENGTH: 0.0696
        },
        BASEPOINT: {
            WIDTH: 8,
            HEIGHT:15
        },
        BLAST: {
            // WIDTH: 50
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
    MAIN_WORK: {
    },
    SUPPORTING_WORK: {
    },
    IDEL_TIME: {
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
    ACTIVITY: {
        CHARGING: 113,
        BLASTING: 114,
    },
    EQUIPMENT_INFO: {
        "1": "JUMBO DRILL(2B)",
        "2": "JUMBO DRILL(3B)",
        "3": "CHARGING CAR",
        "4": "WHEEL LOADER",
        "5": "DUMP TRUCK",
        "6": "EXCAVATOR(WHEEL)",
        "7": "EXCAVATOR(CRAWLER)",
        "8": "SHOTCRETE MACHINE",
        "9": "JCB",
        "10": "CORE DRILLING MACHINE",
        "11": "DOZER",
        "12": "GROUTING MACHINE",
        "13": "MAI PUMP",
        "14": "MOBILE PRODUCTION UNIT",
        "15": "CHARGING PUMP UNIT",
        "16": "BUS",
        "17": "WCBH Drilling Machine",
        "18": "Explosive Van",
        "19": "Concrete Mixer Truck",
        "20": "Shuttle",
        "21": "Worker"
    }
};
if (window.CONSTANTS.IS_DEV) {
    //window.CONSTANTS.URL.CONSOLE = 'http://192.168.0.15:5000';
    window.CONSTANTS.URL.CONSOLE = 'http://127.0.0.1:5000';
}
