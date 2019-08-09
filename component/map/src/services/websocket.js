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
    }

    disconnect() {
        if (!!this.socket) {
            this.socket.close();
        }
    }

    send(data) {
        if (!!this.socket) {
            this.socket.send(JSON.stringify(data));
        }
    }

    call(data, handler) {
        const ident = this._createRequestId();
        _.extend(data, {
            i: ident
        });
        this._registerHandler(ident, handler)
        this.send(data);
        console.log("call", data);
    }

    subscribe(internal, handlers) {
        this.call({
            e: window.CONSTANTS.REQUEST_TYPE.SUBSCRIBE,
            kwargs:{
                client_kind: "L",
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
                client_kind: "L"
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
            if (!!data) {
                if (_.has(data,"i")) { //Event 데이터
                    console.log("revcie", data);
                    this._handleResponse(data);
                } else {            //Response 데이터
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
                case window.CONSTANTS.EVENT_TYPE.GET_DETECTED_LIST:
                    this._subscribeHandlers.getDetectedList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.HUB_ONLINE:
                    this._subscribeHandlers.hub_online(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.HUB_OFFLINE:
                    this._subscribeHandlers.hub_offline(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.REFRESH:
                    this._subscribeHandlers.refresh(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.REOPEN_STREAM:
                    this._subscribeHandlers.reopenStream(data);
                break;
            }
        }
    }

    _onError(e) {
        console.log("Socket is error ", e);
    }
}