export default {
    methods: {
        isNumber : (value) => (!_.isNaN(value) && _.isNumber(value)),
        isScanner: (kind) => { return _.isEqual(kind, window.CONSTANTS.PRODUCT_KIND.HUB)},
        isIpcam: (kind) => { return _.isEqual(kind, window.CONSTANTS.PRODUCT_KIND.IPCAM)},
        isBeacon: (kind) => { return _.isEqual(kind, window.CONSTANTS.PRODUCT_KIND.MIBSSKEC) || _.isEqual(kind, window.CONSTANTS.PRODUCT_KIND.NEW_BEACON)},
        isSpeaker: (kind) => { return _.isEqual(kind, window.CONSTANTS.PRODUCT_KIND.SPEAKER)},
        isRouter: (kind) => { return _.isEqual(kind, window.CONSTANTS.PRODUCT_KIND.ROUTER)}
    }
}
