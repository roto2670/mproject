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
        //this.socket = new WebSocket(`ws://${ host }:${ port }/ws`);
        this.socket = new WebSocket(`ws://127.0.0.1:5555/ws`);
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
                client_kind: 'W',
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
                if (_.has(data,"i")) { //Event 데이터
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
                case window.CONSTANTS.EVENT_TYPE.UPDATE_BASEPOINT_LIST:
                    this._subscribeHandlers.updateBasePointList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_TUNNEL_LIST:
                    this._subscribeHandlers.updateTunnelList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_BLAST_LIST:
                    this._subscribeHandlers.updateBlastList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_BLAST_INFO_LIST:
                    this._subscribeHandlers.updateBlastInfoList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_WORK_LIST:
                    this._subscribeHandlers.updateWorkList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_WORK_HISTORY_LIST:
                    this._subscribeHandlers.updateWorkHistoryList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_PAUSE_HISTORY_LIST:
                    this._subscribeHandlers.updatePauseHistoryList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_WORK_EQUIPMENT_LIST:
                    this._subscribeHandlers.updateWorkEquipmentList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_MESSAGE_LIST:
                    this._subscribeHandlers.updateMessageList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_TEAM_LIST:
                    this._subscribeHandlers.updateTeamList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_ACTIVITY_LIST:
                    this._subscribeHandlers.updateActivityList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_CHARGING_LIST:
                    this._subscribeHandlers.updateChargingList(data);
                break;
                case window.CONSTANTS.EVENT_TYPE.UPDATE_BLASTING_LIST:
                    this._subscribeHandlers.updateBlastingList(data);
                break;
//                case window.CONSTANTS.EVENT_TYPE.UPDATED:
//                    this._subscribeHandlers.updated(data);
//                break;
//                case window.CONSTANTS.EVENT_TYPE.REMOVED:
//                    this._subscribeHandlers.removed(data);
//                break;
//                case window.CONSTANTS.EVENT_TYPE.UPDATE_ALARM_LIST:
//                    this._subscribeHandlers.updateAlarmList(data);
//                break;
//                case window.CONSTANTS.EVENT_TYPE.UPDATE_GROUP_LIST:
//                    this._subscribeHandlers.updateGroupList(data);
//                case window.CONSTANTS.EVENT_TYPE.UPDATE_RESERVE_LIST:
//                    this._subscribeHandlers.updateReserveList(data);
//                break;
//                case window.CONSTANTS.EVENT_TYPE.UPDATE_STREAMING_STATUS:
//                    this._subscribeHandlers.updateStreamingStatus(data);
//                break;
            }
        }
    }

    _onError(e) {
        console.log("Socket is error ", e);
    }
}