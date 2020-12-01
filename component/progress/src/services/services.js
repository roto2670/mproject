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


export const addBasePoint = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/basepoint/add`,
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

export const updateBasePoint = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/basepoint/update`,
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

export const removeBasePoint = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/basepoint/remove`,
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

export const addTunnel = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/tunnel/add`,
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
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/tunnel/remove`,
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

export const updateTunnel = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/tunnel/update`,
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

export const setChargingDetail = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/charging/detail/set`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if (response.data) {
            successCallback(response.data);
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback();
    });
}

export const setBlastingDetail = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blasting/detail/set`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then(response => {
        if (response.data) {
            successCallback(response.data);
        } else {
            failCallback();
        }
    }).catch(error => {
        failCallback();
    });
}

export const addBlast = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blast/add`,
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

export const removeBlast = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blast/remove`,
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

export const updateBlast = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blast/update`,
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

export const addBlastInfo = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blastinfo/add`,
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

export const removeBlastInfo = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blastinfo/remove`,
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

export const updateBlastInfo = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/blastinfo/update`,
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

export const addWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/add`,
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

export const addCompletedWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/add/completed`,
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

export const updateWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/update`,
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

export const removeWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/remove`,
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

export const updateWorkState = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/workprog/work/state`,
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

export const startWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/start`,
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

export const stopWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/stop`,
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

export const stopCompletedWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/stop/completed`,
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

export const finishWork = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/finish`,
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

export const getChargingList = (successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/charging/get/list`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.data) {
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
        if (response.data) {
            successCallback(response.data);
        } else {
            failCallback(error);
        }
    }).catch(error => {
        failCallback(error);
    });
}

export const addWorkEquipment = (data, successCallback, failCallback) => {
    axios({
        url: `${ window.CONSTANTS.URL.CONSOLE }/work/work/equipment/add`,
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