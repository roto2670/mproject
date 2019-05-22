import * as services from '@/services/services'
import Vue from 'vue'
const CHECK_THRESOLD_TIME = 1000 * 60;
//60 * 1000; // 1 min

let instance = null;
export class BeaconDetector {
    constructor(vm, detectedCallback) {
        if (instance) {
            return instance;
        }

        this._timers = [];
        this.hubIds = [];
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
        }, CHECK_THRESOLD_TIME));

        console.info('Beacon detector started');
    }

    stop() {
        this._clearTimer();
        this.isRunning = false;

        console.info('Beacon detector stopped');
    }

    _refreshBeacons() {
        let hubList = this._vm.$store.getters.getHubs;
        this._vm._.forEach(hubList, (hub) => {
            services.getDetectBeaconList(hub.id, (result) => {
                this._vm.$store.commit('addGadgets', result);
                this._detectedCallback(result); // TODO: brush up result.
            }, (error) => {
                console.warn('Failed to refresh beacons.', error);
            });
        });
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
