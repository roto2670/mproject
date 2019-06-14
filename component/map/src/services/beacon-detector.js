import * as services from '@/services/services'

let instance = null;
export class BeaconDetector {
    constructor(vm, info, detectedCallback, failCallback) {
        if (instance) {
            return instance;
        }

        this._timers = [];
        this._isRunning = false;
        this._vm = vm;
        this._detectedCallback = detectedCallback || function() {};
        this._failCallback = failCallback || function() {};
        this.check_threshold = null;
        this.info = info;
        instance = this;
    }

    start() {
        this._isRunning = true;
        if (_.isNumber(this.info.interval)) {
            this.check_threshold = this.info.interval * 1000;
        } else {
            this.check_threshold = 60 * 1000;
        }
        //TODO: remove
        this.check_threshold = 10 * 1000;
        this._timers.push(setInterval(() => {
            this._refreshBeacons();
        }, this.check_threshold));
    
        console.debug('Beacon detector started');
    }

    stop() {
        this._clearTimer();
        this._isRunning = false;
    
        console.debug('Beacon detector stopped');
    }

    isRunning() {
        return this._isRunning;
    }

    _refreshBeacons() {
        this._detectedCallback();
    }

    _clearTimer() {
        _.forEach(this._timers, (timer) => {
            try {
                clearInterval(timer);
            } catch (error) {
                console.warn('Failed to clear detector timer.', error);
            }
        });

        this._timers = [];
    }
}
