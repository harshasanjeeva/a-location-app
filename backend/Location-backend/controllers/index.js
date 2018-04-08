var DeviceDb = require("../models/devices");
var LocationDb = require("../models/localtions");
var _ = require("underscore");

async function deviceList() {
  try {
    let listOfDevices = await DeviceDb.find({}).exec();

    return await _.each(listOfDevices, async item => {
      let count = await LocationDb.find({ deviceId: item.deviceId })
        .count()
        .exec();
      console.log(count);
      item.__v = count;
      return item;
    });
  } catch (e) {
    console.log(e);
  }
}

async function deviceBasedLocations(req, res) {
  try {
    let lcoations = await LocationDb.find({ deviceId: req.body.data })
      .sort({ created: -1 })
      .exec();

    console.log(lcoations);
    return lcoations;
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  FETCH_DEVICES: deviceList,
  FETCH_LOCATIONS: deviceBasedLocations
};
