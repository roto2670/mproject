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

export const getIpcams = (handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.GET_DATA,
        kwargs: {
            kind: 'ipcam'
        },
        _t: _getTimestamp()
    }, handler)
}

export const openStreaming = (gadgetIdList, handler) => {
    socket.call({
        e: window.CONSTANTS.REQUEST_TYPE.OPEN_STREAMING,
        kwargs: {
            ids: gadgetIdList
        },
        _t: _getTimestamp()
    }, handler)
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