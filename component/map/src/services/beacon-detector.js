import * as services from '@/services/services'
import Vue from 'vue'
const CHECK_THRESOLD_TIME = 10 * 1000; //10 sec
                            //600 * 1000; // 10 min

let instance = null;
const vm = new Vue({});
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
        if (!this.isRunning) {
            this.isRunning = true;
        }
        this._timers.push(setInterval(() => {
            //this._refreshBeacons();
        }, CHECK_THRESOLD_TIME));

        console.info('Beacon detector started');
    }

    stop() {
        this._clearTimer();
        this.isRunning = false;

        console.info('Beacon detector stopped');
    }

    _refreshBeacons() {
        this._vm.$store.getters.getHubs((hubList) => {
            hubList.forEach((hub) => {
                services.detectBeaconList(hub.id, (result) => {
                    //console.log(this._vm.$store);
                    this._vm.$store.commit('addGadget', result);
                    this._detectedCallback(result); // TODO: brush up result.
                }, (error) => {
                    console.warn('Failed to refresh beacons.', error);
                });
            })
        })
    }

    _clearTimer() {
        this._timers.forEach((timer) => {
            try {
                clearInterval(timer);
            } catch (error) {
                console.warn('Failed to clear detector timer.', error);
            }
        });

        this._timers = [];
    }
}
