import axios from 'axios'

// TODO: SERVER_BASE_URL
const SERVER_BASE_URL = 'http://127.0.0.1:5000';
//const SERVER_BASE_URL = '';
export const setHubLocation = (hub, successCallback, errorCallback) => {
  // TODO: deferred

  axios
    .post(SERVER_BASE_URL + '/dash/hubs/location', {'hub': hub}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(e => {
      console.log('SUCCESS!!')
      //console.log(hub);
    })
    .catch(e => {
      console.log('FAILURE!!')
      console.log(hub);
    })
}
export const getHubs = (successCallback, errorCallback) => {
  var hubList = [];
  axios({
    url: SERVER_BASE_URL + '/dash/scanner/list',
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    if (!!response.data) {
      hubList = response.data;

      successCallback(hubList);
    } else {
      console.log('File is not exist')
    }
  });
}
export const getBeacons = () => {
  var beaconList = [],
    returnObject = [];
  axios({
    url: SERVER_BASE_URL + '/dash/beacons/list',
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    if (!!response.data) {
      beaconList = response.data;
      console.log("beaconList", beaconList);
      for (var _i in beaconList) {
        returnObject[_i] = getListFilter(beaconList[_i], "id");
      }
      successCallback();
    } else {
      console.log('File is not exist')
    }
  });
  return returnObject;

  function errorCallback() {
    console.log("Failed to Get Beacon List");
  };

  function successCallback() {
    console.log("Success to Get Beacon List");
  };

  function getListFilter(data, id) {
    var returnObject = [];
    for (var key in data) {
      if (key === id) {
        returnObject[key] = data[key];
      }
    }
    return returnObject;
  }
}
export const detectBeaconList = (hubId, successCallback, failCallback) => {
    var detbeaconList = {};
    axios({
      url: SERVER_BASE_URL + '/dash/beacons/detected/' + hubId,
      method: 'GET',
      responseType: 'text' // important
    }).then(response => {
      if (!!response.data) {
        detbeaconList = response.data;
        console.log("aa",detbeaconList['data']);
        successCallback(detbeaconList['data']);
      } else {
        failCallback(console.log("Failed to Get detBeacons List"))
      }
    });
}

export const getGadgets = (gadgetIds, successCallback, failCallback) => {
    let gadgets = [];
    _getGadgets(gadgetIds, gadgets, () => {
        successCallback(gadgets);
    });
}

export const getGadget = (gadgetId, successCallback, failCallback) => { // TODO: force reload?
    axios({
      url: SERVER_BASE_URL + '/dash/beacons/' + gadgetId,
      method: 'GET',
      responseType: 'text'
    }).then(response => {
      if (response.data) {
        successCallback(response.data);
      } else {
        failCallback("Failed to get gadget, id: ${gadgetId}"); // TODO: server error
      }
    });
}

function _getGadgets(gadgetIds, gadgets, doneCallback) {
    let id = gadgetIds.shift();
    if (id) {
        getGadget(id, (gadget) => {
            gadgets.push(gadget);
            _getGadgets(gadgetIds, gadgets, doneCallback);
        }, () => {
            _getGadgets(gadgetIds, gadgets, doneCallback);
        });
    } else {
        doneCallback();
    }
}
