var express = require("express");
var router = express.Router();
var shortId = require("shortid");
var moment = require("moment");

var DeviceDB = require("../models/devices");
var LocationDB = require("../models/localtions");

var Controllers = require("../controllers");

var FCM = require("fcm-push");
var fcm = new FCM(
  "AAAAV0sfL-0:APA91bGCuNOndyZb19OhoeGKsig_Ey9EpNF_0beUdXAgOAhUcyBkEuHeLcuYPY76SxojgS39Sm48mYmnNy6eT_Mh6DYcPbihWmhALdAFFU1kIsVKqgE6Bjkh7I4LF43AtXU8xeHNPTjt"
);

let schedule = require("node-schedule");

schedule.scheduleJob("*/15 * * * *", function() {
  var message = {
    to: "/topics/userlist", // required fill with device token or topics
    collapse_key: "nothing",
    notification: {
      title: "Provide Location",
      body: "Open the app buddy!!"
    }
  };

  //callback style
  fcm.send(message, function(err, response) {
    console.log(err);
    console.log(response);
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
});

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

async function checkDeviceAlreadyExist(body) {
  try {
    let results = await DeviceDB.findOne({ deviceId: body.deviceId }).exec();
    return results;
  } catch (e) {
    return e;
  }
}

async function createDevice(body) {
  try {
    let newDevice = await DeviceDB.findOneAndUpdate(
      { deviceId: body.deviceId },
      {
        $set: {
          deviceId: body.deviceId,
          created: new Date(),
          modified: new Date(),
          _id: shortId.generate()
        }
      },
      { new: true, upsert: true }
    ).exec();
    return newDevice;
  } catch (e) {
    return e;
  }
}

async function udateDevice(body) {
  try {
    let updatedDevice = await DeviceDB.findOneAndUpdate(
      { deviceId: body.deviceId },
      {
        $set: {
          modified: new Date()
        }
      }
    ).exec();

    return updatedDevice;
  } catch (e) {
    return e;
  }
}
//hey 
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

async function updateLocation(body) {
  let lastLocation = await LocationDB.findOne()
    .sort({ created: -1 })
    .exec();

  let withIn30min = false;
  if (
    lastLocation == null ||
    moment(lastLocation.created).add(30, "minutes") > moment()
  ) {
    withIn30min = true;
  }
  let differenceInKm = 0;

  if (lastLocation != null) {
    differenceInKm = getDistanceFromLatLonInKm(
      body.coordintes.latitude,
      body.coordintes.longitude,
      lastLocation.latitude,
      lastLocation.longitude
    );
  }

  let newL = new LocationDB({
    deviceId: body.deviceId,
    latitude: body.coordintes.latitude,
    longitude: body.coordintes.longitude,
    withIn30min: withIn30min,
    differenceInKm: differenceInKm
  });
  return newL.save();
}

router.post("/updateUserLocation", function(req, res) {
  let body = req.body;

  checkDeviceAlreadyExist(body)
    .then(device => {
      console.log(device);
      if (device == null) {
        console.log("sasasa");
        return createDevice(body);
      }
      return udateDevice(body);
    })
    .then(updateLocation(body))
    .then(e => res.send({ type: "success" }))
    .catch(e => res.send({ type: "error" }));
});

router.post("/server/api", function(req, res) {
  let body = req.body;

  if (body.type) {
    Controllers[body.type](req, res)
      .then(result => {
        res.send({ response: result, type: "success" });
      })
      .catch(error => res.send({ type: "error" }));
  } else res.send({ type: "error" });
});

module.exports = router;
