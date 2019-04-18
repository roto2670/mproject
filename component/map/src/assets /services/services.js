import axios from 'axios'

// TODO: SERVER_BASE_URL
const SERVER_BASE_URL = 'http://127.0.0.1:16000';
export const setHubLocation = (hub) => {
  console.log('data: ', hub);
  // let formData = new FormData();
  // for(var i in hub) {
  //     formData.append('hub',hub);
  // }
  // console.log("formdata1", formData);
  axios
    .post(SERVER_BASE_URL + '/dash/hubs/location', hub, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(e => {
      console.log('SUCCESS!!')
      console.log(hub);
    })
    .catch(e => {
      console.log('FAILURE!!')
      console.log(hub);
    })

}
export const getHubs = (successCallback, errorCallback) => {
  var returnObject = [];
  var hubList = [{
      "id": "799b9f874bc1c50775233d2a0c00e388",
      "uuid": "240ac4a64c9e",
      "account_id": "cfb95812a3f3a92996bc5a0c922fd249",
      "status": 1,
      "ftl": null,
      "name": "mibh(4c9e)",
      "kind": "com.thenaran.rtos.m",
      "app_version": "0.1.18",
      "platform": "rtos",
      "model": "hubm",
      "locale": "locale",
      "system_version": "v4.0-dev-91-gb7b5c3a8c",
      "msg_token": "id/799b9f874bc1c50775233d2a0c00e388",
      "gadget_ids": [
        "2f7ce57203915d7c9505f71c8f4b1555"
      ],
      "latest_version": "0.1.19",
      "beacons": [{
          "uuid": "fab50d95-70bd-ffff-ffff-ffffffffffff",
          "major": -1,
          "minor": -1,
          "interval": 3
        },
        {
          "uuid": "gbb95812-a3f3-a929-96bc-5a0c922fd249",
          "major": -1,
          "minor": -1,
          "interval": 5
        },
        {
          "uuid": "fab50d95-70bd-ffff-ffff-ffffffddffff",
          "major": -1,
          "minor": -1,
          "interval": 3
        },
        {
          "uuid": "cfb95812-a3f3-a929-96bc-5a0c922fd249",
          "major": -1,
          "minor": -1,
          "interval": 3
        },
        {
          "uuid": "gfb95812-a3f3-a929-96bc-5a0c922fd249",
          "major": -1,
          "minor": -1,
          "interval": 5
        },
        {
          "uuid": "fab50d95-7dbd-ffff-ffff-ffffffddffff",
          "major": -1,
          "minor": -1,
          "interval": 3
        },
        {
          "uuid": "fab50d95-70db-ffff-ffff-ffffffffffff",
          "major": -1,
          "minor": -1,
          "interval": 3
        }
      ],
      "custom": null,
      "tags": null
    },
    {
      "id": "124534653233d2a0c00e388",
      "uuid": "240ac4a64c9e",
      "account_id": "cfb95812a3f3a92996bc5a0c922fd249",
      "status": 1,
      "ftl": null,
      "name": "mibh(4c9e)",
      "kind": "com.thenaran.rtos.m",
      "app_version": "0.1.18",
      "platform": "rtos",
      "model": "hubm",
      "locale": "locale",
      "system_version": "v4.0-dev-91-gb7b5c3a8c",
      "msg_token": "id/799b9f874bc1c50775233d2a0c00e388",
      "gadget_ids": [
        "2f7ce57203915d7c9505f71c8f4b1555"
      ],
      "latest_version": "0.1.19",
      "beacons": [{
          "uuid": "fab50d95-70bd-ffff-ffff-ffffffffffff",
          "major": -1,
          "minor": -1,
          "interval": 3
        },
        {
          "uuid": "gbb95812-a3f3-a929-96bc-5a0c922fd249",
          "major": -1,
          "minor": -1,
          "interval": 5
        },
        {
          "uuid": "fab50d95-70bd-ffff-ffff-ffffffddffff",
          "major": -1,
          "minor": -1,
          "interval": 3
        },
        {
          "uuid": "cfb95812-a3f3-a929-96bc-5a0c922fd249",
          "major": -1,
          "minor": -1,
          "interval": 3
        },
        {
          "uuid": "gfb95812-a3f3-a929-96bc-5a0c922fd249",
          "major": -1,
          "minor": -1,
          "interval": 5
        },
        {
          "uuid": "fab50d95-7dbd-ffff-ffff-ffffffddffff",
          "major": -1,
          "minor": -1,
          "interval": 3
        },
        {
          "uuid": "fab50d95-70db-ffff-ffff-ffffffffffff",
          "major": -1,
          "minor": -1,
          "interval": 3
        }
      ],
      "custom": null,
      "tags": null
    }
  ];

  successCallback(hubList);
  // var hubListDiv = {};
  // var returnObject = {};
  // hubListDiv = hubList.slice();
  // function getListFilter(data, id) {
  //   var returnObject = [];
  //   for (var key in data) {
  //     if (key === id) {
  //       returnObject[key] = data[key];
  //     }
  //   }
  //   return returnObject;
  // };
  // for (var _i in hubListDiv) {
  //   returnObject[_i] = getListFilter(hubListDiv[_i], "name");
  // };
  // console.log(returnObject);
  // return returnObject;


  /*var hubList = [],
      returnObject = [];
  axios({
    url: SERVER_BASE_URL + '/dash/scanner/list',
    method: 'GET',
    responseType: 'text' // important
  }).then(response => {
    if (!!response.data) {
      //console.log('rs: ', response);
      //hubList.push(response.data[0]);
      hubList = response.data;
      for (var _i in hubList) {
        returnObject[_i] = getListFilter(hubList[_i], "id");
      }
      successCallback();
    } else {
      console.log('File is not exist')
    }
  });
  return returnObject;
  function errorCallback() {
    console.log("Failed to Get Hub List");
  };

  function successCallback() {
    console.log("Success to Get Hub List");
  };

  function getListFilter(data, id) {
    var returnObject = [];
    for (var key in data) {
      //console.log(data[id]);
      if (key === id) {
        returnObject[key] = data[key];
      }
    }
    return returnObject;
}*/
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
      //console.log('rs: ', response);
      //hubList.push(response.data[0]);
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
    console.log("Failed to Get Hub List");
  };

  function successCallback() {
    console.log("Success to Get Hub List");
  };

  function getListFilter(data, id) {
    var returnObject = [];
    for (var key in data) {
      //console.log(data[id]);
      if (key === id) {
        returnObject[key] = data[key];
      }
    }
    return returnObject;
  }
}
export const detectBeaconList = (hubId) => {
    var detbeaconList = {},
        slicedbeaconList = {},
        returnObject = {};
    axios({
      url: SERVER_BASE_URL + '/dash/beacons/detected/' + hubId,
      method: 'GET',
      responseType: 'text' // important
    }).then(response => {
      if (!!response.data) {
        //console.log('rs: ', response);
        //hubList.push(response.data[0]);
        detbeaconList = response.data;
        console.log(detbeaconList);
        //slicedbeaconList = detbeaconList.slice();
        console.log("detectBeaconList", slicedbeaconList);
        for (var _i in slicedbeaconList) {
          console.log("_i",_i);
          returnObject[_i] = getListFilter(slicedbeaconList[_i], "_t");
          console.log()
        }
        successCallback();
      } else {
        console.log('File is not exist')
      }
    });
    return returnObject;

    function errorCallback() {
      console.log("Failed to Get Hub List");
    };

    function successCallback() {
      console.log("Success to Get Hub List");
    };

    function getListFilter(data, id) {
      var returnObject = [];
      for (var key in data) {
        //console.log(data[id]);
        if (key === id) {
          returnObject[key] = data[key];
        }
      }
      return returnObject;
    }
}
