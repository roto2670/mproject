import * as services from '@/services/services'

let instance = null;
export class BeaconDetector {
    constructor(vm, detectedCallback, failCallback) {
        if (instance) {
            return instance;
        }

        this._timers = [];
        this.isRunning = false;
        this._vm = vm;
        this._detectedCallback = detectedCallback || function() {};
        this._failCallback = failCallback || function() {};
        this.check_threshold = null;
        this.info = null;
        instance = this;
    }

    start(info) {
        this.info = info;
        if (this.isRunning) {
            this.isRunning = true;
        }
        // if (_.isNumber(this.info.interval)) {
        //     this.check_threshold = this.info.interval * 1000;
        // } else {
        //     this.check_threshold = 60 * 1000;
        // }
        this.check_threshold = 600000 * 1000;
        this._timers.push(setInterval(() => {
            this._refreshBeacons();
        }, this.check_threshold));
    
        console.info('Beacon detector started');
    }

    stop() {
        this._clearTimer();
        this.isRunning = false;

        console.info('Beacon detector stopped');
    }

    _refreshBeacons() {
        let hubList = this._vm.$store.getters.getHubsWhichIsInMap,
            viewLength = 0,
            cnt = 0;
        if (!_.isEmpty(hubList)) {
            services.getBeacons(this.info.product_id, (bcnData) => {
                this._vm.$store.commit('removeGadgets');
                this._vm.$store.commit('removeHubs'); 
                this._vm.$store.commit('addDetectedGadget', bcnData);
                _.forEach(hubList, (hub) => {
                    if (hub.view === window.CONSTANTS.HUB_VIEW.IN_MAP) {
                        viewLength++;
                        services.getDetectBeaconList(hub.id, (detectedGadgetList) => {
                            cnt++;
                            this._vm.$store.commit('addDetectedHubGadget', detectedGadgetList);
                            if (cnt === viewLength) {
                                this._detectedCallback(console.debug('Success to update'));
                            } 
                        }, (err) => {
                            this._failCallback(err);
                        });
                    }
                })
            }, (err) => {
                this._failCallback(err);
            })
        }
    }

    _clearTimer() {
        this._.forEach(this._timers, (timer) => {
            try {
                clearInterval(timer);
            } catch (error) {
                console.warn('Failed to clear detector timer.', error);
            }
        });

        this._timers = [];
    }
}
