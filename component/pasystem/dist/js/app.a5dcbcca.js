(function(t){function e(e){for(var i,o,r=e[0],c=e[1],l=e[2],d=0,h=[];d<r.length;d++)o=r[d],s[o]&&h.push(s[o][0]),s[o]=0;for(i in c)Object.prototype.hasOwnProperty.call(c,i)&&(t[i]=c[i]);u&&u(e);while(h.length)h.shift()();return a.push.apply(a,l||[]),n()}function n(){for(var t,e=0;e<a.length;e++){for(var n=a[e],i=!0,r=1;r<n.length;r++){var c=n[r];0!==s[c]&&(i=!1)}i&&(a.splice(e--,1),t=o(o.s=n[0]))}return t}var i={},s={app:0},a=[];function o(e){if(i[e])return i[e].exports;var n=i[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.m=t,o.c=i,o.d=function(t,e,n){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},o.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)o.d(n,i,function(e){return t[e]}.bind(null,i));return n},o.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="/";var r=window["webpackJsonp"]=window["webpackJsonp"]||[],c=r.push.bind(r);r.push=e,r=r.slice();for(var l=0;l<r.length;l++)e(r[l]);var u=c;a.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"034f":function(t,e,n){"use strict";var i=n("64a9"),s=n.n(i);s.a},"1a3f":function(t,e,n){},"22de":function(t,e,n){"use strict";var i=n("25be"),s=n.n(i);s.a},"25be":function(t,e,n){},"4d2b":function(t,e,n){"use strict";var i=n("6b3c"),s=n.n(i);s.a},"4f95":function(t,e,n){"use strict";var i=n("906e"),s=n.n(i);s.a},"56d7":function(t,e,n){"use strict";n.r(e);var i={};n.r(i),n.d(i,"websocketConnect",function(){return mt}),n.d(i,"websocketDisconnect",function(){return _t}),n.d(i,"subscribe",function(){return vt}),n.d(i,"unsubscribe",function(){return Tt}),n.d(i,"updateData",function(){return gt}),n.d(i,"getInfo",function(){return St}),n.d(i,"getMapFile",function(){return wt}),n.d(i,"getSpeakers",function(){return kt}),n.d(i,"getAlarmList",function(){return yt}),n.d(i,"setAlarmList",function(){return bt});n("cadf"),n("551c"),n("f751"),n("097d");var s=n("2b0e"),a=n("415c"),o=n.n(a),r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("Main")],1)},c=[],l=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"main-container",attrs:{id:"main"}},[n("Top",{on:{"select-top-button":t.handleTopButton}}),t.isShowingFilter?n("FilterList",{attrs:{groupList:t.getTagList},on:{"select-checkbox":t.handleChangedCheckbox}}):t._e(),t.isShowingInfoWindow?n("InfoWindow",{attrs:{isForGroup:t.isForGroup,item:t.infoWindowItem},on:{"select-close":t.handleInfoWindowClose}}):t._e(),n("div",{staticClass:"map-container",attrs:{id:t.id}})],1)},u=[],d=(n("55dd"),n("ac6a"),n("ec60")),h=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"top-container",attrs:{id:"top"}},[n("div",{staticClass:"button-frame"},t._l(t.types,function(e){return n("TopButton",{key:e,attrs:{type:e},on:{"select-button":t.handleSelectedButton}})}),1)])},p=[],f=function(){var t=this,e=t.$createElement,n=t._self._c||e;return t.isImageButton?n("div",{staticClass:"button-panel",attrs:{id:"top-button"},on:{click:t.handleSelectedButton}},[n("div",{staticClass:"button-image",class:t.type})]):n("div",{staticClass:"text-button-panel",attrs:{id:"top-button"},on:{click:t.handleSelectedButton}},[n("div",{staticClass:"text-button-image-panel"},[n("div",{staticClass:"text-button-image",class:t.type})]),n("div",{staticClass:"text-button-label"},[n("div",{staticClass:"text-button"},[t._v(t._s(t.buttonText))])])])},m=[],v={name:"TopButton",props:{type:{type:String,required:!0}},data:function(){return{isPressed:!1}},methods:{handleSelectedButton:function(){this.type===window.CONSTANTS.TOP_BUTTON_TYPE.PLUS&&this.type===window.CONSTANTS.TOP_BUTTON_TYPE.MINUS||(this.isPressed=!this.isPressed),this.$emit("select-button",this.type)}},computed:{isImageButton:function(){return this.type===window.CONSTANTS.TOP_BUTTON_TYPE.PLUS||this.type===window.CONSTANTS.TOP_BUTTON_TYPE.MINUS||this.type===window.CONSTANTS.TOP_BUTTON_TYPE.FILTER},buttonText:function(){var t="";return this.type===window.CONSTANTS.TOP_BUTTON_TYPE.SOUND_SET_UP?t="SOUND SET-UP":this.type===window.CONSTANTS.TOP_BUTTON_TYPE.BROADCAST&&(t="BROADCAST"),t}},created:function(){console.log("top button",this.type)}},T=v,g=(n("4f95"),n("2877")),S=Object(g["a"])(T,f,m,!1,null,null,null),w=S.exports,k={name:"top",components:{TopButton:w},data:function(){return{types:window.CONSTANTS.TOP_BUTTON_TYPE,isActiveFilter:!1}},methods:{handleSelectedButton:function(t){this.$emit("select-top-button",t)}}},y=k,b=(n("599a"),Object(g["a"])(y,h,p,!1,null,null,null)),C=b.exports,E=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"filter-container",attrs:{id:"filter-list"}},[n("div",{staticClass:"filter-frame"},t._l(t.groupList,function(e,i){return n("FilterItem",{key:i,attrs:{item:e},on:{"select-checkbox":t.handleChangedCheckBox}})}),1)])},O=[],N=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"filter-item-panel",attrs:{id:"filter-item"}},[n("div",{staticClass:"filter-item-wrapper"},[n("label",{staticClass:"filter-item-label"},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.checked,expression:"checked"}],staticClass:"filter-item-checkbox",attrs:{type:"checkbox"},domProps:{checked:Array.isArray(t.checked)?t._i(t.checked,null)>-1:t.checked},on:{change:[function(e){var n=t.checked,i=e.target,s=!!i.checked;if(Array.isArray(n)){var a=null,o=t._i(n,a);i.checked?o<0&&(t.checked=n.concat([a])):o>-1&&(t.checked=n.slice(0,o).concat(n.slice(o+1)))}else t.checked=s},t.handleSelectedCheckbox]}}),t._v(t._s(t.getItemName)+"\n        ")])])])},L=[],A={name:"FilterItem",props:{item:{type:String}},data:function(){return{checked:!0}},computed:{getItemName:function(){return this.item<0?"All Group":"Group - ".concat(this.item)}},methods:{handleSelectedCheckbox:function(){this.$emit("select-checkbox",this.item,this.checked)}}},I=A,P=(n("9c10"),Object(g["a"])(I,N,L,!1,null,null,null)),x=P.exports,B={name:"FilterList",components:{FilterItem:x},props:{groupList:{type:Array,default:[]}},data:function(){return{allGroupKey:"-1"}},methods:{handleChangedCheckBox:function(t,e){this.$emit("select-checkbox",t,e)}},created:function(){console.log("Create filter list ",this.groupList)}},U=B,D=(n("4d2b"),Object(g["a"])(U,E,O,!1,null,null,null)),M=D.exports,R=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"info-container",attrs:{id:"infowindow"}},[n("div",{staticClass:"info-left-panel"},[t.isForGroup?n("div",{staticClass:"group-speaker-panel"},[n("div",{staticClass:"group-text-wrapper"},[n("div",{staticClass:"info-title"},[t._v("SPEAKERS")]),n("div",{staticClass:"group-wrapper"},t._l(t.item,function(e,i){return n("div",{key:i,staticClass:"info-text"},[t._v(t._s(e))])}),0)]),n("div",{staticClass:"group-list-panel"},[n("div",{staticClass:"group-list-title"},[n("div",{staticClass:"group-list-text"},[t._v(t._s(t.item.length+" speakers"))])]),n("div",{staticClass:"group-list-wrapper"},t._l(t.speakersInGroup,function(e,i){return n("div",{key:i,staticClass:"speaker-list-panel"},[n("div",{staticClass:"speaker-list-text"},[t._v(t._s(e.name))])])}),0)])]):n("div",{staticClass:"info-speaker-panel"},[n("div",{staticClass:"info-text-wrapper"},[n("div",{staticClass:"info-title"},[t._v("SPEAKER")]),n("div",{staticClass:"info-text"},[t._v(t._s(t.item.name))]),n("div",{staticClass:"info-title group"},[t._v("GROUP")]),n("div",{staticClass:"info-text"},[t._v(t._s(t.getGroupName))])]),t._m(0)])]),n("div",{staticClass:"info-right-panel"},[n("PlayList",{attrs:{list:t.playList}})],1),n("div",{staticClass:"info-close-button",on:{click:t.handleSelectCloseButton}})])},F=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"alarm-image-panel"},[n("div",{staticClass:"alarm-image"})])}],G=(n("6762"),n("2fdb"),function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"alarm-container",attrs:{id:"playlist"}},[n("div",{staticClass:"alarm-list-frame"},[n("div",{staticClass:"alarm-list-wrapper"},t._l(t.list,function(e,i){return n("div",{key:i,staticClass:"alarm-list-panel",class:{selected:t.isSelectedItem(e)},on:{click:function(n){return t.handleSelectedItem(e)}}},[n("div",{staticClass:"alarm-name-panel"},[n("div",{staticClass:"alarm-name"},[t._v(" "+t._s(e.id))])])])}),0)]),t._m(0)])}),Y=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"alarm-play-frame"},[n("div",{staticClass:"play-icon-panel"},[n("div",{staticClass:"icon-image play-icon"})]),n("div",{staticClass:"volume-down-panel"},[n("div",{staticClass:"icon-image volume-down"})]),n("div",{staticClass:"volume-up-panel"},[n("div",{staticClass:"icon-image volume-up"})])])}],$={name:"PlayList",props:{list:{type:Array,detault:[]}},data:function(){return{selectedItem:null}},methods:{isSelectedItem:function(t){return!!this.selectedItem&&this.selectedItem.id===t.id},handleSelectedItem:function(t){this.selectedItem&&this.selectedItem.id===t.id?this.selectedItem=null:this.selectedItem=t,console.log("selected item",t)}},created:function(){console.log("create play list ",this.list)}},j=$,W=(n("6880"),Object(g["a"])(j,G,Y,!1,null,null,null)),z=W.exports,V={name:"InfoWindow",components:{PlayList:z},props:{isForGroup:{type:Boolean},item:{required:!0}},data:function(){return{playList:[],speakersInGroup:[]}},methods:{handleGroupList:function(){var t=this,e=this.$store.getters.getSpeakers;this._.forEach(e,function(e){var n=t._.first(e.tags);t._.includes(t.item,n)&&t.speakersInGroup.push(e)})},handleSelectItem:function(t){var e=this.playList[t];console.log(e)},handleSelectCloseButton:function(){this.$emit("select-close")}},computed:{getGroupName:function(){var t=this._.first(this.item.tags);return"Group - ".concat(t)}},created:function(){this.isForGroup&&this.handleGroupList(),this.playList=this.$store.getters.getAlarmList}},H=V,Z=(n("ecf3"),Object(g["a"])(H,R,F,!1,null,null,null)),q=Z.exports,Q={name:"Main",components:{Top:C,FilterList:M,InfoWindow:q},data:function(){return{id:"map",info:{},map:null,paLayers:{},polygonLayers:{},zoomLevel:0,markers:{},polygons:{},connectMarkers:{},speakerByTags:{},isShowingFilterList:!1,infoWindowItem:null,checkInterval:null,isWebsoketConnected:!1,groupList:[],isForGroup:!1}},methods:{_initLoadMap:function(){var t=this;this.services.getMapFile(function(e){t.map=new d["c"](t.id,{center:[90,50],zoom:5,maxZoom:7,minZoom:4,maxExtent:new d["a"](0,0,180,80),zoomAnimation:!0,zoomInCenter:!1,panAnimation:!1,dragRotate:!1,dragPitch:!1,drgaRotatePitch:!1,touchGesture:!1,touchZoom:!1,touchRotate:!1,touchPitch:!1,touchZoomRotate:!1,doubleClickZoom:!1,baseLayer:new d["b"]("base",[{url:e,extent:[0,0,180,80],opactiy:1}],{opactiy:1})}),t._registerMapHandler()})},_registerMapHandler:function(){var t=this;this.map&&(this.map.once("baselayerload",function(){t.zoomLevel=t.map.getZoom()/11*50,t._getSpeakers(),t._getAlarmList()}),this.map.on("zoomend moveend",function(e){t.zoomLevel=t.map.getZoom()/11*50}),this.map.on("click",function(e){t.infoWindowItem={}}))},_registerItemsByTag:function(t){this._.has(this.speakerByTags,t)||(this.speakerByTags[t]=[]),this._.has(this.paLayers,t)||(this.paLayers[t]=new d["f"]("pa".concat(t)).addTo(this.map),this.paLayers[t].setZIndex(1),this.polygonLayers[t]=new d["f"]("polygon".concat(t)).addTo(this.map))},_getSpeakers:function(){var t=this;this.services.getSpeakers(function(e){t._.forEach(e,function(e){var n=t._.first(e.tags);t.$store.commit("addSpeaker",e),t._registerItemsByTag(n),t._drawSpeaker(e)}),t._drawPolygons()})},_drawSpeakers:function(t){var e=this;this._.forEach(t,function(t){e._drawSpeaker(t)})},_drawSpeaker:function(t){var e=this;console.log("Draw speaker");var n=t.custom.map_location,i=this._.first(t.tags),s="".concat(window.CONSTANTS.URL.BASE_IMG,"speaker.svg"),a=new d["d"]([n.x,n.y],{symbol:{markerFile:s,markerWidth:this.zoomLevel,markerHeight:this.zoomLevel,markerDy:10},draggable:!0});a.addTo(this.paLayers[i]),this.speakerByTags[i].push(t.id),this.markers[t.id]=a,a.on("dragend",function(n){n.domEvent.stopPropagation();var i=e._.first(t.tags),s=a._coordinates;t.custom.map_location={x:s.x,y:s.y},e._updatePolygon(i)}),a.on("click",function(n){n.domEvent.stopPropagation(),e.infoWindowItem=t,e.isForGroup=!1})},_drawPolygons:function(){var t=this;this._.forEach(this.speakerByTags,function(e,n){t._drawPolygon(e,n)})},_drawPolygon:function(t,e){var n=this._sortLocationList(t),i=new d["e"](n,{symbol:{polygonFill:"rgb(255, 75, 25)",polygonOpacity:.5,lineColor:"rgb(255, 75, 25)",lineWidth:1}});i.addTo(this.polygonLayers[e]),this.polygons[e]=i},_removePolygon:function(t){var e=this.polygons[t];e&&(e.hide(),delete this.polygons[t])},_updatePolygon:function(t){var e=this.polygons[t],n=this.speakerByTags[t];if(e){var i=this._sortLocationList(n);e.setCoordinates(i)}},_getAlarmList:function(){var t=this;this.services.getAlarmList(function(e){t._.forEach(e,function(e){t.$store.commit("addAlarmData",e)})})},_zoomIn:function(){this.map&&this.map.zoomIn(7)},_zoomOut:function(){this.map&&this.map.zoomOut(6)},_sortLocationList:function(t){var e=this,n=[],i=[],s=0,a=0,o=0,r=0,c={};return this._.forEach(t,function(t,i){var c=e.$store.getters.getSpeaker(t),l=c.custom.map_location;0===i?(s=l.x,a=l.x,o=l.y,r=l.y):(l.x<s&&(s=l.x),l.x>a&&(a=l.x),l.y<o&&(o=l.y),l.y>r&&(r=l.y)),n.push(l)}),c={x:s+(a-s)/2,y:o+(r-o)/2},this._.forEach(n,function(t,n){t.angle=Math.acos((t.x-c.x)/e._lineDistance(c,t)),t.y>c.y&&(t.angle=Math.PI+Math.PI-t.angle)}),n=n.sort(function(t,e){return t.angle-e.angle}),this._.forEach(n,function(t){i.push([t.x,t.y])}),i},_lineDistance:function(t,e){var n=0,i=0;return n=e.x-t.x,n*=n,i=e.y-t.y,i*=i,Math.sqrt(n+i)},_handleFilterGroup:function(t,e){e?(this.paLayers[t].show(),this.polygonLayers[t].show(),this.groupList.push(t)):(this.paLayers[t].hide(),this.polygonLayers[t].hide())},handleTopButton:function(t){t===window.CONSTANTS.TOP_BUTTON_TYPE.PLUS?this._zoomIn():t===window.CONSTANTS.TOP_BUTTON_TYPE.MINUS?this._zoomOut():t===window.CONSTANTS.TOP_BUTTON_TYPE.FILTER?this.isShowingFilterList=!this.isShowingFilterList:t===window.CONSTANTS.TOP_BUTTON_TYPE.BROADCAST&&(this.isForGroup=!0,this.infoWindowItem=this.groupList)},handleChangedCheckbox:function(t,e){console.log("changed checkbox ",t,e),this._handleFilterGroup(t,e)},handleInfoWindowClose:function(){this.infoWindowItem={}},websocketConnect:function(){var t=this,e=window.location.hostname;window.CONSTANTS.IS_DEV&&(e="192.168.0.15"),this.services.websocketConnect(e,5555,function(){console.log("Connect with websocket"),t.isWebsocketConnected=!0,t.stopInterval()},function(){console.warn("Disconnect with websocket"),t.isWebsocketConnected=!1,t.startInterval()},function(){console.error("Error")})},startInterval:function(){var t=this;this.checkInterval||(this.checkInterval=setInterval(function(){t.websocketConnect()},1e4))},stopInterval:function(){this.checkInterval&&clearInterval(this.checkInterval),this.checkInterval=null}},computed:{getTagList:function(){return this._.keys(this.paLayers)},isShowingFilter:function(){return this.isShowingFilterList},isShowingInfoWindow:function(){return!this._.isEmpty(this.infoWindowItem)}},mounted:function(){this._initLoadMap()},created:function(){var t=this;console.log("Create Main vue"),this.services.getInfo(function(e){t._.isObject(e)&&(console.log("Succeed to get info ",e),t.info=e,t.websocketConnect(),t.startInterval())})}},J=Q,K=(n("22de"),Object(g["a"])(J,l,u,!1,null,null,null)),X=K.exports,tt={components:{Main:X}},et=tt,nt=(n("034f"),Object(g["a"])(et,r,c,!1,null,null,null)),it=nt.exports,st=n("8c4f");s["a"].use(st["a"]);var at=new st["a"]({mode:"history",base:"/",routes:[]}),ot=n("2f62");s["a"].use(ot["a"]);var rt=new ot["a"].Store({state:{speakers:{},alarmList:{}},getters:{getSpeakers:function(t){return _.values(t.speakers)},getSpeaker:function(t){return function(e){return t.speakers[e]}},getAlarmList:function(t){return _.values(t.alarmList)},getAlarmData:function(t){return function(e){return t.alarmList[e]}}},mutations:{addSpeakers:function(t,e){_.forEach(e,function(e){t.speakers[e.id]=e})},addSpeaker:function(t,e){t.speakers[e.id]=e},removeSpeaker:function(t,e){_.has(t.speakers,e)&&delete t.speakers[e]},removeSpeakers:function(t){_.forEach(t.speakers,function(e,n){delete t.speakers[n]}),t.speakers={}},updateSpeaker:function(t,e){_.has(t.speakers,e.id)&&(t.speakers[e.id]=e)},addAlarmList:function(t,e){_.forEach(e,function(e){t.alarmList[e.id]=e})},addAlarmData:function(t,e){t.alarmList[e.id]=e},removeAlarmList:function(t){_.forEach(t.alarmList,function(e,n){delete t.alarmList[n]}),t.alarmList={}},removeAlarmData:function(t,e){_.has(t.alarmList,e)&&delete t.alarmList[e]}},actions:{}}),ct=(n("d1a0"),n("6b54"),n("bc3a")),lt=n.n(ct),ut=n("d225"),dt=n("b0b4"),ht=(n("7e3c"),function(){function t(){Object(ut["a"])(this,t),this._handler={},this._subscribeHandlers=null,this.socket=null,this.clientId=null}return Object(dt["a"])(t,[{key:"connect",value:function(t,e,n,i,s){var a=this;this.socket=new WebSocket("ws://".concat(t,":").concat(e,"/ws")),this.socket.onopen=n,this.socket.onerror=s,this.socket.onclose=i,this.socket.onmessage=function(t){a._onMessage(t)}}},{key:"disconnect",value:function(){this.socket&&this.socket.close()}},{key:"send",value:function(t){this.socket&&this.socket.send(JSON.stringify(t))}},{key:"call",value:function(t,e){var n=this._createRequestId();_.extend(t,{i:n}),this._registerHandler(n,e),this.send(t)}},{key:"subscribe",value:function(t,e){var n=this;this.call({e:window.CONSTANTS.REQUEST_TYPE.SUBSCRIBE,kwargs:{client_kind:"P",internal:t},_t:new Date/1e3},function(t){n.clientId=t}),this._subscribeHandlers=e}},{key:"unsubscribe",value:function(){this.call({e:window.CONSTANTS.REQUEST_TYPE.UNSUBSCRIBE,kwargs:{client_id:this.clientId,client_kind:"P"},_t:new Date/1e3},function(){}),console.log("unsubscribe is called"),this._subscribeHandlers=null}},{key:"_createRequestId",value:function(){return Math.random().toString(36).substr(2,5)}},{key:"_registerHandler",value:function(t,e){this._handler[t]||(this._handler[t]=e)}},{key:"_authenticate",value:function(){if(this.socket){var t={};t.ident=_createRequestId(),t.value={name:"authenticate",args:"key",namespace:""};var e=JSON.stringify(t);this.send(e)}}},{key:"_onOpen",value:function(t){1===this.readyState&&this._authenticate()}},{key:"_onClose",value:function(t){}},{key:"_onMessage",value:function(t){var e=null;try{e=JSON.parse(t.data)}finally{e&&(_.has(e,"i")?this._handleResponse(e):this._handleEvent(e))}}},{key:"_handleResponse",value:function(t){var e=this._handler[t.i];e&&(e(t.v),delete this._handler[t.i])}},{key:"_handleEvent",value:function(t){if(t)switch(t.e){case window.CONSTANTS.EVENT_TYPE.ADDED:this._subscribeHandlers.added(t);break;case window.CONSTANTS.EVENT_TYPE.UPDATED:this._subscribeHandlers.updated(t);break;case window.CONSTANTS.EVENT_TYPE.REMOVED:this._subscribeHandlers.removed(t);break;case window.CONSTANTS.EVENT_TYPE.UPDATE_ALARM_LIST:this._subscribeHandlers.updateAlarmList(t);break}}},{key:"_onError",value:function(t){console.log("Socket is error ",t)}}]),t}()),pt=new ht,ft=function(){return new Date/1e3},mt=function(t,e,n,i,s){pt.connect(t,e,n,i,s)},_t=function(){pt.disconnect()},vt=function(t,e){pt.subscribe(t,e)},Tt=function(){pt.unsubscribe()},gt=function(t,e,n){pt.call({e:window.CONSTANTS.REQUEST_TYPE.UPDATE_DATA,kwargs:{kind:e,data:t},_t:ft()},n)},St=function(t){window.CONSTANTS.IS_DEV?t({interval:10,product_id:"mibsskec",stage:0,internal:!0}):lt()({url:"".concat(window.CONSTANTS.URL.CONSOLE,"/dash/location/info"),method:"GET",responseType:"text"}).then(function(e){e.data?t(e.data):(console.warn("File is not exist"),t())}).catch(function(e){console.warn("Failed to get info ",e),t()})},wt=function(t){var e="".concat(window.CONSTANTS.URL.BASE_IMG,"map.png");lt()({url:"".concat(window.CONSTANTS.URL.CONSOLE,"/dashboard/location/view"),method:"GET",responseType:"text"}).then(function(n){n.data?(console.log("Success to Get map image file",n.data),t("".concat(window.location.protocol,"//").concat(window.location.host).concat(n.data))):(console.warn("Sorry, Img file does not exist"),t(e))}).catch(function(n){console.warn("Failed to get map file ",n),t(e)})},kt=function(t){window.CONSTANTS.IS_DEV?t(Ct()):pt.call({e:window.CONSTANTS.REQUEST_TYPE.GET_DATA,kwargs:{kind:"speaker"},_t:ft()},t)},yt=function(t){window.CONSTANTS.IS_DEV?setTimeout(function(){t([{id:"abc"},{id:"def"},{id:"ghi"},{id:"jkl"},{id:"mno"}])},1500):pt.call({e:window.CONSTANTS.REQUEST_TYPE.GET_ALARM_LIST,_t:ft()},t)},bt=function(t,e){},Ct=function(){for(var t=[],e=0;e<15;e++){var n=Math.round(3*Math.random()),i=Math.round(Math.random()*(10+e)),s=Math.round(Math.random()*(10+e)),a={id:"aaabbb".concat(e),name:"speaker-".concat(e),tags:[n.toString()],custom:{map_location:{x:89.47265625+i,y:43.13771481219632+s}}};t.push(a)}return t};s["a"].config.productionTip=!1,s["a"].prototype.services=i,s["a"].use(o.a),new s["a"]({router:at,store:rt,render:function(t){return t(it)}}).$mount("#app")},"599a":function(t,e,n){"use strict";var i=n("1a3f"),s=n.n(i);s.a},"64a9":function(t,e,n){},"64f9":function(t,e,n){},6880:function(t,e,n){"use strict";var i=n("8dbd"),s=n.n(i);s.a},"6b3c":function(t,e,n){},"8dbd":function(t,e,n){},"906c":function(t,e,n){},"906e":function(t,e,n){},"9c10":function(t,e,n){"use strict";var i=n("906c"),s=n.n(i);s.a},d1a0:function(t,e){window.CONSTANTS={IS_DEV:!0,URL:{CONSOLE:"",BASE_IMG:"imgs/"},TOP_BUTTON_TYPE:{PLUS:"plus",MINUS:"minus",FILTER:"filter",SOUND_SET_UP:"sound_set_up",BROADCAST:"broadcast"},EVENT_TYPE:{ADDED:"added",UPDATED:"updated",REMOVED:"removed",UPDATE_ALARM_LIST:"update_alarm_list"},REQUEST_TYPE:{SUBSCRIBE:"subscribe",UNSUBSCRIBE:"unsubscribe",GET_DATA:"get_data",UPDATE_DATA:"update_data",GET_ALARM_LIST:"get_alarm_list",SET_ALARM_LIST:"set_alarm_list"}},window.CONSTANTS.IS_DEV&&(window.CONSTANTS.URL.CONSOLE="http://127.0.0.1:5000")},ecf3:function(t,e,n){"use strict";var i=n("64f9"),s=n.n(i);s.a}});
//# sourceMappingURL=app.a5dcbcca.js.map