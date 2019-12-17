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

export const getSpeakers = (handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.GET_DATA,
        kwargs: {
            kind: 'speaker'
        },
        _t: _getTimestamp()
    }, handler);
}

export const getAlarmList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/alarm/list`,
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            console.warn('Failed to get alarm data');
            failCallback();
        }
    }).catch(error => {
        console.warn("Failed to get alarm data ", error);
        failCallback();
    });
}

export const addAlarmData = (file, successCallback, failCallback) => {
    let formdata = new FormData();
        formdata.append('file', file);
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/alarm/upload?file=${ file.name }`,
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formdata
    }).then(response => {
        if(response.data) {
            successCallback();
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback();
    });
}

export const removeAlarmData = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/alarm/delete`,
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
        failCallback(error);
    });
}

export const streamAlarm = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/alarm/stream`,
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        data:data
    }).then(response => {
        if (response.data) {
            successCallback(response.data);
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback(error);
    })
}

export const stopStreamAlarm = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/alarm/stop`,
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        data:data
    }).then(response => {
        if (response.data) {
            successCallback();
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback(error);
    })
}

export const addGroupData = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/group/create`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if(response.data) {
            successCallback();
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback(error);
    });
}

export const stopStreamVoice = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/voice/stop`,
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        data: {}
    }).then(response => {
        if (response.data) {
            successCallback();
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback(error);
    })
}

export const voiceStream = (data, id, volume, successCallback, failCallback) => {
    let formdata = new FormData();
      formdata.append('data', data);
      formdata.append('volume', volume);
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/voice/stream?id=${ id }`,
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formdata
    }).then(response => {
        if(response.data) {
            successCallback();
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback(error);
    });
}

export const removeGroupData = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/group/delete`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if(response.data) {
            successCallback();
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback(error);
    });
}

export const getGroupData = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/group/list`,
        method: 'GET'
    }).then(response => {
        if(response.data) {
            console.log('Success to get group data', response.data);
            successCallback(response.data);
        } else {
            console.warn('Failed to get group data');
            failCallback();
        }
    }).catch(error => {
        console.warn("Failed to get group data ", error);
        failCallback();
    });
}

export const getStreamStatus = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/stream/status`,
        method: 'GET'
    }).then(response => {
        if(response.data) {
            console.log('Success to get stream status', response.data);
            successCallback(response.data);
        } else {
            console.warn('Failed to get stream status');
            failCallback();
        }
    }).catch(error => {
        console.warn("Failed to get stream status ", error);
        failCallback();
    });
}

export const changeGroupName = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/group/update/name`,
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
        failCallback(error);
    });
}

export const updateSpeakerInGroup = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/group/update/speaker`,
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

export const createReserveAlarm = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/reserve/create`,
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

export const removeReserveAlarm = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/reserve/delete`,
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

export const pauseReserveAlarm = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/reserve/pause`,
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

export const getReserveAlarmList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/reserve/list`,
        method: 'GET'
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

export const getPlayList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/list`,
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            console.warn('Failed to get playlist');
            failCallback();
        }
    }).catch(error => {
        console.warn("Failed to get playlist", error);
        failCallback();
    });
}

export const addPlayList = (data, successCallback, failCallback) => {
    let reqData = {
        'id_list': data
    }
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/list/add`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: reqData
    }).then(response => {
        if(response.data) {
            successCallback();
        } else {
            console.warn('Failed to add playlist');
            failCallback();
        }
    }).catch(error => {
        console.warn('Failed to add playlist', error);
        failCallback();
    });
}

export const removePlayList = (data, successCallback, failCallback) => {
    let reqData = {
        'id_list': data
    }
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/list/remove`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: reqData
    }).then(response => {
        if(response.data) {
            successCallback(response.data);
        } else {
            console.warn('Failed to remove playlist');
            failCallback();
        }
    }).catch(error => {
        console.warn('Failed to remove playlist', error);
        failCallback(error);
    });
}

export const getPaStatus = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/stream/status`,
        method: 'GET'
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
