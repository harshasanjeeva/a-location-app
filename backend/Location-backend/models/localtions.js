var mongoose = require("mongoose");
var shortId = require("shortid"),
  createdModifiedPlugin = require("mongoose-createdmodified")
    .createdModifiedPlugin;
// define the schema for our user model
mongoose.set("debug", true);

var locations = mongoose.Schema({
  _id: {
    type: String,
    default: shortId.generate
  },
  deviceId: { type: String },
  latitude: String,
  longitude: String,
  differenceInKm: { type: Number, default: 0 },
  withIn30min: Boolean
});

locations.plugin(createdModifiedPlugin, { index: true });

module.exports = mongoose.model("locations", locations);
