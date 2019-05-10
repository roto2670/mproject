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
      // Success
      // console.log('SUCCESS!!', e)
    })
    .catch(e => {
      console.log('FAILURE!!', e)
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

export const getHubListConnectedToGadget = (gadgetuuid, successCallback, errorCallback) => {
    let hubList = {};
    axios({
        url: SERVER_BASE_URL + '/dash/hubs/detected/' + gadgetuuid,
        method: 'GET',
        responseType: 'text' // important
    }).then(response => {
        let dataObj = response.data;
        if (!!dataObj && _.isArray(dataObj.data)) {
            hubList = dataObj;
            successCallback(hubList);
        } else {
            console.log("fail to load connectedGadget");
        }
    });
}

export const getBeacons = (successCallback, failCallback) => {
  var beaconList = [],
    returnObject = [];
  axios({
    url: SERVER_BASE_URL + '/dash/beacons/list/mibs',
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    if (!!response.data) {
      beaconList = response.data;
      console.log("beaconList", beaconList);
      successCallback(beaconList);
    } else {
      console.log('File is not exist')
    }
  });
}
export const getDetectBeaconList = (hubId, successCallback, failCallback) => {
    let beaconList = {};
    axios({
      url: SERVER_BASE_URL + '/dash/beacons/detected/' + hubId,
      method: 'GET',
      responseType: 'text' // important
    }).then(response => {
      let dataObj = response.data;
      if (!!dataObj && _.isArray(dataObj.data)) {
        beaconList = dataObj.data;
        successCallback(beaconList);
      } else {
        failCallback();
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
        failCallback(`Failed to get gadget, id: ${gadgetId}`); // TODO: server error
      }
    });
}

export const getMapFiles = (successCallback, failCallback) => {
    axios({
        url: SERVER_BASE_URL + '/dashboard/location/view',
        method: 'GET',
        responseType: 'text'
    }).then(response => {
        if(response.data) {
            console.log('Success to Get map image file')
            successCallback('http://' + window.location.host + response.data);
        } else {
            console.log('Sorry, Img file does not exist');
        }
    })
}

export const postMapFile = (file, successCallback, failCallback) => {
    let formData = new FormData()
    if(file) {
        formData.append('file', file)
        axios
            .post(SERVER_BASE_URL + '/dashboard/location/upload', formData, {
                headers: {
                    'Content-Type': 'multiart/form-data'
                }
            })
            .then(e => {
                console.log('Success to Upload map image file')
                successCallback('http://' + window.location.host + e.data)
            })
            .catch(e => {
                console.log('Fail to Upload map image file')
            })
    }
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
