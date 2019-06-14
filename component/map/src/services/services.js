import axios from 'axios'
import { fail } from 'assert';
import * as WebSocket from '@/services/websocket';

const socket = new WebSocket.SocketClient();
const _getTimestamp = () => new Date() / 1000.0;

export const websocketConnect = (host, port, connectCallback, disconnectCallback, errorCallback) => {
    socket.connect(host, port, connectCallback, disconnectCallback, errorCallback);
}

export const websocketDisconnect = () => {
    socket.disconnect();
}

export const subscribe = (handlers, callback) => {
    socket.subscribe(handlers, callback);
}

export const unsubscribe = () => {
    socket.unsubscribe();
}

export const updateData = (data, kind, handler) => { //hub, ipcam, mibsskec 데이터 업데이트
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.UPDATE_DATA,
        kwargs: {
            kind: kind,
            data: data
        },
        _t: _getTimestamp()
    }, handler);
}

export const getMapFile = (readyCallback) => {
    const baseImageUrl = `${ window.CONSTANTS.URL.BASE_IMG }map.png`;
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/dashboard/location/view`,
        method: 'GET',
        responseType: 'text'
    }).then(response => {
        if(response.data) {
            console.log('Success to Get map image file', response.data);
            readyCallback(`${ window.location.protocol }//${ window.location.host }${ response.data}`);
        } else {
            console.warn('Sorry, Img file does not exist');
            readyCallback(baseImageUrl);
        }
    }).catch(error => {
        console.warn("Failed to get map file ", error);
        readyCallback(baseImageUrl);
    });
}

export const postMapFile = (file, successCallback, failCallback) => {
    let formData = new FormData()
    if(file) {
        formData.append('file', file)
        axios
        .post(`${ window.CONSTANTS.URL.CONSOLE }/dashboard/location/upload`, formData, {
            headers: {
                'Content-Type': 'multiart/form-data'
            }
        })
        .then(e => {
            console.warn('Success to Upload map image file');
            successCallback(`http://${ window.location.host }${ e.data }`);
        })
        .catch(e => {
            failCallback(e);
        });
    } else {
        failCallback();
    }
}

export const updateGadgetData = (beacon, successCallback, failCallback) => {
    axios
    .post(`${ window.CONSTANTS.URL.CONSOLE }/dash/beacons/update`, {'beacon': beacon}, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(e => {
        successCallback();
    })
    .catch(e => {
        failCallback();
    });
}

export const getInfo = (readyCallback) => {
    if (window.CONSTANTS.IS_DEV) {
        readyCallback({
            interval: 10,
            product_id: 'mibsskec',
            stage: 0
        });
    } else {
        axios({
            url: `${ window.CONSTANTS.URL.CONSOLE }/dash/location/info`,
            method: 'GET',
            responseType: 'text' // important
        }).then(response => {
            if (!!response.data) {
                readyCallback(response.data);
            } else {
                console.warn('File is not exist')
                readyCallback();
            }
            }).catch(error => {
                console.warn("Failed to get info ", error);
                readyCallback();
        });
    }
}

export const getIpcams = (handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.GET_DATA,
        kwargs: {
            kind: window.CONSTANTS.PRODUCT_KIND.IPCAM
        },
        _t: _getTimestamp()
    }, handler)
}


export const getHubs = (handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.GET_DATA,
        kwargs: {
            kind: window.CONSTANTS.PRODUCT_KIND.HUB
        },
        _t: _getTimestamp()
    }, handler);
}

export const getBeacons = (product_id, handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.GET_DATA,
        kwargs: {
            kind: product_id
        },
        _t: _getTimestamp()
    }, handler);
}

export const getDetectBeaconList = (handler) => { //TODO: 한번에 비콘이 몇개씩 날라오는지 결정해야함
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.GET_DETECTED_LIST,
        _t: _getTimestamp()
    }, handler)
}

export const openIpcamStream = (ipcamId, handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.OPEN_STREAM,
        kwargs: {
            ids: ipcamId
        },
        _t: _getTimestamp()
    }, handler)
}

export const closeIpcamStream = (ipcamId, handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.CLOSE_STREAM,
        kwargs: {
            ids: ipcamId
        },
        _t: _getTimestamp()
    }, handler)
}