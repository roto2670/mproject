import axios from 'axios'
import * as WebSocket from '@/services/websocket';
import { read } from 'fs';

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

export const postMapFile = (file, successCallback, failCallback) => {
    let formData = new FormData()
    if(file) {
        formData.append('file', file)
        axios
        .post(`${ window.CONSTANTS.URL.CONSOLE }/dashboard/location/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
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

export const getGadgetCountList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/dash/gadget/count/list`,
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => {
        if(response.data) {
            console.log('Success to get gadget count list', response.data);
            successCallback(response.data);
        } else {
            console.warn('Failed to get gadget count list');
            failCallback();
        }
    }).catch(error => {
        console.warn("Failed to get alarm data ", error);
        failCallback();
    });
}

export const postAlarmId = (id, successCallback, failCallback) => {
    axios({
        // TODO: PA URL
        url: `${ window.CONSTANTS.URL.TEST.URL }/pa/alarm/stream`,
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        data:id
    }).then(response => {
        if (response.data) {
            successCallback();
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback();
    })
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
            console.log("response", response);
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
    }, handler)
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

export const getSpeakers = (handler) => { //TODO: name change
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.GET_DATA,
        kwargs: {
            kind: window.CONSTANTS.PRODUCT_KIND.SPEAKER
        },
        _t: _getTimestamp()
    }, handler);
}

export const getAlarms = (handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.GET_ALARM_LIST,
        _t: _getTimestamp()
    }, handler);
}

export const setAlarms = (data, handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.SET_ALARM,
        kwargs: [{
            name: data.name,
            data: data.file
        }],
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

export const getAlarmList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.PA }/pa/alarm/list`,
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => {
        if(response.data) {
            console.log('Success to get alarm data', response.data);
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

export const getRouters = (handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.GET_DATA,
        kwargs: {
            kind: window.CONSTANTS.PRODUCT_KIND.ROUTER
        },
        _t: _getTimestamp()
    }, handler);
}

// progress services function
export const getBasePointList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/basepoint/get/list`,
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

export const getTunnelList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/tunnel/get/list`,
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

export const getTunnelListByBasePoint = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/tunnel/get/list/basepoint`,
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

export const getBlastList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blast/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getBlastListByTunnel = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blast/get/list/tunnel`,
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

export const getBlastInfoList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blastinfo/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getBlastInfoByBlast = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blastinfo/get/blast`,
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

export const getWorkList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getChargingList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/charging/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getBlastingList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blasting/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getWorkListByBlast = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/get/list/blast`,
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

export const getPauseListByWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/pausehistory/get/list/work`,
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

export const getPauseList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/pausehistory/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getActivityList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/activity/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getEquipmentList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/equipment/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getOperatorList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/operator/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getEquipmentInfoList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/equipment/info/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getWorkOperatorByWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/operator/get/list/work`,
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

export const getWorkEquipmentByWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/equipment/get/list/work`,
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

export const getWorkDataByWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/workdata/get/list/work`,
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

export const getMessageList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/message/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

export const getTeamList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/team/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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