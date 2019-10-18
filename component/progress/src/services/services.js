import axios from 'axios';
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

export const updateData = (data, kind, handler) => { //speaker 데이터 업데이트
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.UPDATE_DATA,
        kwargs: {
            kind: kind,
            data: data
        },
        _t: _getTimestamp()
    }, handler);
}

export const getInfo = (readyCallback) => {
    if (window.CONSTANTS.IS_DEV) {
        readyCallback({
            interval: 10,
            product_id: 'mibsskec',
            stage: 0,
            internal: true
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

export const getMapFile = (readyCallback) => {
    const baseImageUrl = `${ window.CONSTANTS.URL.BASE_IMG }map.png`;
    if (window.CONSTANTS.IS_DEV) {
        readyCallback(baseImageUrl);
    } else {
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
}

export const addTunnel = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/workprog/tunnel/add`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            failCallback(error);
        }
    }).catch(error => {
        failCallback(error);
    });
}

export const removeTunnel = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/workprog/tunnel/remove`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            failCallback(error);
        }
    }).catch(error => {
        failCallback(error);
    });
}

export const getTunnels = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/workprog/tunnel/get`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            failCallback(error);
        }
    }).catch(error => {
        failCallback(error);
    });
}

export const updateTunnel = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/workprog/tunnel/update`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            failCallback(error);
        }
    }).catch(error => {
        failCallback(error);
    });
}

export const addProgress = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/workprog/progress/add`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback();
    });
}

export const getProgress = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/workprog/progress/get`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            failCallback(error);
        }
    }).catch(error => {
        failCallback(error);
    });
}

export const removeProgress = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/workprog/progress/remove`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            failCallback(error);
        }
    }).catch(error => {
        failCallback(error);
    });
}