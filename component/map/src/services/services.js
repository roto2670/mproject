import axios from 'axios'

// TODO: readyCallback -> sucessCallback, failCallback
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
    });
}

export const getInfo = (readyCallback) => {
  axios({
    url: window.CONSTANTS.URL.CONSOLE + '/dash/location/info',
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    if (!!response.data) {
      readyCallback(response.data);
    } else {
      console.log('File is not exist')
      readyCallback();
    }
  }).catch(error => {
    console.warn("Failed to get info ", error);
    readyCallback();
  });
}

export const getHubs = (readyCallback) => {
  axios({
    url: window.CONSTANTS.URL.CONSOLE + '/dash/scanner/list',
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    if (!!response.data) {
      readyCallback(response.data);
    } else {
      console.log('File is not exist')
      readyCallback([]);
    }
  }).catch(error => {
    console.warn("Failed to get hubs ", error);
    readyCallback([]);
  });
}

export const getHubListConnectedToGadget = (gadgetId, readyCallback) => {
  axios({
    url: window.CONSTANTS.URL.CONSOLE + '/dash/hubs/detected/' + gadgetId,
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    const dataObj = response.data;
    if (!!dataObj && _.isArray(dataObj.data)) {
      readyCallback(dataObj);
    } else {
      console.log("fail to load connectedGadget");
      readyCallback({});
    }
  }).catch(error => {
    console.warn("Failed to get hub list connected to gadget ", error);
    readyCallback({});
  });
}

export const getBeacons = (product_id, readyCallback) => {
  axios({
    url: window.CONSTANTS.URL.CONSOLE + '/dash/beacons/list/' + product_id,
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    if (!!response.data) {
      readyCallback(response.data);
    } else {
      console.log('beacon is not exist')
      readyCallback([]);
    }
  }).catch(error => {
    console.warn("Failed to get beacons ", error);
    readyCallback([]);
  });
}

export const getDetectBeaconList = (hubId, successCallback, failCallback) => {
  axios({
    url: window.CONSTANTS.URL.CONSOLE + '/dash/beacons/detected/' + hubId,
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    const dataObj = response.data;
    if (!!dataObj && _.isArray(dataObj.data)) {
      successCallback(dataObj);
    } else {
      failCallback('not exist');
    }
  }).catch(error => {
    failCallback(error);
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
  }).catch(error => {
    failCallback(error);
  });
}

export const getMapFiles = (readyCallback) => {
  const baseImageUrl = window.CONSTANTS.URL.BASE_IMG + 'map.png';
  axios({
    url: window.CONSTANTS.URL.CONSOLE + '/dashboard/location/view',
    method: 'GET',
    responseType: 'text'
  }).then(response => {
    if(response.data) {
      console.log('Success to Get map image file')
      readyCallback(window.location.protocol + '//' + window.location.host + response.data);
    } else {
      console.log('Sorry, Img file does not exist');
      readyCallback(baseImageUrl);
    }
  }).catch(error => {
    console.warn("Failed to get map file ", error);
    readyCallback(baseImageUrl);
  });
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
      failCallback();
    }
  }).catch(error => {
    failCallback(error);
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
          successCallback('http://' + window.location.host + e.data);
      })
      .catch(e => {
        failCallback(e);
      });
  } else {
    failCallback();
  }
}