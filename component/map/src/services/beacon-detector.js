import * as services from '@/services/services'
import Vue from 'vue'

let instance = null;
export class BeaconDetector {
    constructor(vm, detectedCallback) {
        if (instance) {
            return instance;
        }

        this._timers = [];
        this.isRunning = false;
        this._vm = vm;
        this._detectedCallback = detectedCallback || function() {};

        instance = this;
    }

    start() {
        if (this.isRunning) {
            this.isRunning = true;
        }
        this._timers.push(setInterval(() => {
            this._refreshBeacons();
        }, window.CONSTANTS.TIMER.CHECK_THRESHOLD));

        console.info('Beacon detector started');
    }

    stop() {
        this._clearTimer();
        this.isRunning = false;

        console.info('Beacon detector stopped');
    }

    _refreshBeacons(_detectedCallback, failCallback) {
        let hubList = this._vm.$store.getters.getHubsWhichIsInMap,
            viewLength = 0,
            cnt = 0;
        if (!_.isEmpty(hubList)) {
            this._vm.$store.commit('removeGadgets');
            services.getInfo((info) => {
                services.getBeacons(info.product_id, (bcnData) => {
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
                                failCallback(err);
                            });
                        }
                    })
                }, (err) => {
                    failCallback(err);
                })
            }, (err) => {
                failCallback(err);
            });
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
