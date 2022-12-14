import 'websocket';
/*
request body
{
  "i": (int),
  "e": (str)"get/ddd/ddd",
  "args": (list),
  "kwargs": (dict),
  "_t": timestamp
}
response body
  {
  "i": (int),
  "t": (str) e, a
  "v": (any),
  "_t": timestamp
}
*/
export class SocketClient {
    constructor() {
        this._handler = {};
        this._subscribeHandlers = null;
        this.queue = [];
        this.socket = null;
        this.clientId = null;
    }

    connect(host, port, connectCallback, disconnectCallback, errorCallback) { //TODO: params url
        this.socket = new WebSocket(`ws://${ host }:${ port }/ws`);
        // this.socket = new WebSocket(`ws://192.168.1.171:5555/ws`);
        this.socket.onopen = connectCallback;
        this.socket.onerror = errorCallback;
        this.socket.onclose = disconnectCallback;
        this.socket.onmessage = (message) => {
            this._onMessage(message);
        }
        this.socket.addEventListener('open', (event) => {
            _.forEach(this.queue, (item) => {
                this.socket.send(JSON.stringify(item));
            });
            this.queue = [];
        });
    }

    disconnect() {
        if (!!this.socket) {
            this.socket.close();
        }
    }

    send(data) {
        if (!!this.socket && this.socket.readyState === this.socket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            this.queue.push(data);
        }
    }

    call(data, handler) {
        const ident = this._createRequestId();
        _.extend(data, {
            i: ident
        });
        this._registerHandler(ident, handler)
        this.send(data);
    }

    subscribe(internal, handlers) {
        this.call({
            e: window.CONSTANTS.REQUEST_TYPE.SUBSCRIBE,
            kwargs:{
                client_kind: 'P',
                internal: internal
            },
            _t: new Date() / 1000.0
        }, (clientId) => {
            this.clientId = clientId;
            // console.log("Succeed to subsribe for session id");
        });
        this._subscribeHandlers = handlers;
    }

    unsubscribe() {
        this.call({
            e: window.CONSTANTS.REQUEST_TYPE.UNSUBSCRIBE,
            kwargs: {
                client_id: this.clientId,
                client_kind: 'P'
            },
            _t: new Date() / 1000.0
        }, () => {
            // console.log("Succeed to unsubsribe for session id");
        })
        console.log("unsubscribe is called");
        this._subscribeHandlers = null;
    }

    _createRequestId() {
        return Math.random().toString(36).substr(2, 5);
    }

    _registerHandler(ident, handler) {
        if (!!!this._handler[ident]) {
            this._handler[ident] = handler
        }
    }

    _authenticate() {
        if (!!this.socket) {
            let req = {};
            req.ident = _createRequestId();
            req.value = {
                name: 'authenticate',
                args: 'key',
                namespace: ''
            };
            const data = JSON.stringify(req);
            this.send(data);
        }
    }

    _onOpen(e) {
        // console.log("Socket is connected", e);
        if (this.readyState === 1) {
            this._authenticate();
        }
    }

    _onClose(e) {
        // console.log("Socket is disconnected ", e);
    }

    _onMessage(message) {
        let data = null;
        try {
            data = JSON.parse(message.data);
        } finally {
            // console.log(data);
            if (!!data) {
                if (_.has(data,"i")) { //Event ?????????
                    this._handleResponse(data);
                } else {            //Response ?????????
                    this._handleEvent(data);
                }
            }
        }
    }

    _handleResponse(data) {
        const handler = this._handler[data.i];
        if (!!handler) {
            handler(data.v);
            delete this._handler[data.i];
        }
    }

    _handleEvent(data) {
        if (!!data) {
            switch(data.e) {
                case window.CONSTANTS.EVENT_TYPE.ADDED:
                    this._subscribeHandlers.added(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATED:
                    this._subscribeHandlers.updated(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.REMOVED:
                    this._subscribeHandlers.removed(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_ALARM_LIST:
                    this._subscribeHandlers.updateAlarmList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_GROUP_LIST:
                    this._subscribeHandlers.updateGroupList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_RESERVE_LIST:
                    this._subscribeHandlers.updateReserveList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_STREAMING_STATUS:
                    this._subscribeHandlers.updateStreamingStatus(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.ONLINE:
                    this._subscribeHandlers.online(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.OFFLINE:
                    this._subscribeHandlers.offline(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.FAILED_LIST:
                    this._subscribeHandlers.failedList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_PLAY_LIST:
                    this._subscribeHandlers.updatePlayList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.FILE_NONE:
                    this._subscribeHandlers.fileNone(data);
                break;
            }
        }
    }

    _onError(e) {
        console.log("Socket is error ", e);
    }
}