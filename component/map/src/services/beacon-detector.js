import * as services from '@/services/services'
const CHECK_THRESOLD_TIME = 10 * 1000; // 10 sec

let instance = null;
export class BeaconDetector {
    constructor(detectedCallback) {
        if (instance) {
            return instance;
        }

        this._timers = [];
        this.hubIds = [];
        this.isRunning = false;
        this._detectedCallback = detectedCallback || function() {};

        instance = this;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
        }
        this._timers.push(setInterval(() => {

        }, CHECK_THRESOLD_TIME));

        console.info('Beacon detector started');
    }

    stop() {
        this._clearTimer();
        this.isRunning = false;

        console.info('Beacon detector stopped');
    }

    _refreshBeacons() {
        services.detectBeaconList((result) => {
            this._detectedCallback(); // TODO: brush up result.
        }, (error) => {
            console.warn('Failed to refresh beacons.', error);
        });
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