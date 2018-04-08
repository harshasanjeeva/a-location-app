var mongoose = require("mongoose");
var shortId = require("shortid"),
  createdModifiedPlugin = require("mongoose-createdmodified")
    .createdModifiedPlugin;
// define the schema for our user model
mongoose.set("debug", true);

var deviceSchema = mongoose.Schema({
  _id: {
    type: String,
    default: shortId.generate
  },
  deviceId: String, //mobile device id
  fcmToken: String,
  modified: String,
  created: String
});

//deviceSchema.plugin(createdModifiedPlugin, {index: true});

module.exports = mongoose.model("devices", deviceSchema);
