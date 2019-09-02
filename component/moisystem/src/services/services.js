import * as WebSocket from '@/services/websocket';
import axios from 'axios';
import { _ } from 'core-js';

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

export const getIpcams = (handler) => {
    if (window.CONSTANTS.IS_DEV) {
        let ipcams = [];
        for(var i = 0;i < 20; i++) {
            const ipcam = {
                account_id: "90c3d5d2962741a64b1a4fa66a85a7b9",
                battery: 0,
                beacon_spec: {uuid: "90c3d5d2-9627-41a6-4b1a-4fa66a85a7b9", major: 20362, minor: 63704, interval: 700, during_second: 0},
                custom: {ip: "192.168.0.20", password: "admin", id: "admin", map_location: {}, is_visible_moi: true},
                firmware_version: "10.0.0",
                hub_id: "001-smockxxxxxxxxxxxxxxxxxxxxxxx",
                id: `00${i}-imockxxxxxxxxxxxxxxxxxxxxxxx`,
                kind: "ipcam",
                locale: "mock",
                mac: "000-imockxxx",
                model_name: "0",
                model_number: "0",
                name: `${i}testimock`,
                rssi: 0,
                sdk_version: "10.0.0",
                status: 1,
                tags: [],
                user_id: "d44e1444069831c8635ab157344915bb",
            };
            ipcams.push(ipcam);
        }
        handler(ipcams);
    } else {
        socket.call({
            e: window.CONSTANTS.REQUEST_TYPE.GET_DATA,
            kwargs: {
                kind: 'ipcam'
            },
            _t: _getTimestamp()
        }, handler);
    }
}

export const openStreaming = (gadgetIdList, handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.OPEN_STREAMING,
        kwargs: {
            ids: gadgetIdList
        },
        _t: _getTimestamp()
    }, handler)
    // let list = [];
    // _.forEach(gadgetIdList, (id) => {
    //     const obj = {};
    //     obj[id] = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    //     list.push(obj) ;
    // })
    // handler(list);
}

export const closeStreaming = (gadgetIdList, handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.CLOSE_STREAMING,
        kwargs: {
            ids: gadgetIdList
        },
        _t: _getTimestamp()
    }, handler)
}

export const getInfo = (readyCallback) => {
    if (window.CONSTANTS.IS_DEV) {
        readyCallback({
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
