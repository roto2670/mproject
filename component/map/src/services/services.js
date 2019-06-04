import axios from 'axios'

export const setHubLocation = (hub, readyCallback) => {
  axios
    .post(window.CONSTANTS.URL.CONSOLE + '/dash/hubs/location', {'hub': hub}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(e => {
      readyCallback();
    })
    .catch(e => {
      readyCallback();
    })
}

export const getInfo = (successCallback, errorCallback) => {
  axios({
    url: window.CONSTANTS.URL.CONSOLE + '/dash/location/info',
    // url: window.CONSTANTS.URL.CONSOLE + '/dash/info',
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    if (!!response.data) {
      successCallback(response.data);
    } else {
      console.log('File is not exist')
    }
  });
}

export const getHubs = (successCallback, errorCallback) => {
  var hubList = [];
  axios({
    url: window.CONSTANTS.URL.CONSOLE + '/dash/scanner/list',
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
        url: window.CONSTANTS.URL.CONSOLE + '/dash/hubs/detected/' + gadgetuuid,
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

export const getBeacons = (product_id, successCallback, failCallback) => {
  var beaconList = [];
  axios({
    url: window.CONSTANTS.URL.CONSOLE + '/dash/beacons/list/' + product_id,
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    if (!!response.data) {
      beaconList = response.data;
      successCallback(beaconList);
    } else {
      console.log('File is not exist')
    }
  });
}
export const getDetectBeaconList = (hubId, successCallback, failCallback) => {
    let beaconList = {};
    axios({
      url: window.CONSTANTS.URL.CONSOLE + '/dash/beacons/detected/' + hubId,
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

export const getGadget = (gadgetId, successCallback, failCallback) => { // TODO: force reload?
    axios({
      url: window.CONSTANTS.URL.CONSOLE + '/dash/beacons/' + gadgetId,
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
        url: window.CONSTANTS.URL.CONSOLE + '/dashboard/location/view',
        method: 'GET',
        responseType: 'text'
    }).then(response => {
        if(response.data) {
            console.log('Success to Get map image file')
            successCallback(window.location.protocol + '//' + window.location.host + response.data);
        } else {
            console.log('Sorry, Img file does not exist');
        }
    })
}

export const getBeaconImg = (gadgetId, successCallback, failCallback) => {
    var target = window.CONSTANTS.URL.YOUR_CLOUD + '/mib/v1/sense/' + gadgetId;
    axios({
        method: 'GET',
        headers: {
            // 'Src': accountId + '.'
        },
        url: target
    }).then(res => {
        if (res && res.data) {
          successCallback(res.data.v.img_url);
        } else {
          console.log("Failed to get value in storage ", error);
          failCallback(error); 
        }
    });
}

export const postMapFile = (file, successCallback, failCallback) => {
    let formData = new FormData()
    if(file) {
        formData.append('file', file)
        axios
            .post(window.CONSTANTS.URL.CONSOLE + '/dashboard/location/upload', formData, {
                headers: {
                    'Content-Type': 'multiart/form-data'
                }
            })
            .then(e => {
                console.log('Success to Upload map image file');
                successCallback('http://' + window.location.host + e.data)
            })
            .catch(e => {
                console.log('Fail to Upload map image file')
            })
    }
}