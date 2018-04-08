/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  PermissionsAndroid,
  ToastAndroid,
  Dimensions
} from "react-native";

import FCM, { FCMEvent } from "react-native-fcm";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "react-native-geolocation-service";
var DeviceInfo = require("react-native-device-info");
const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

var { height, width } = Dimensions.get("window");

const appUrl = "http://18.188.126.31:3001/";

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);

    this.state = {
      region: {
        latitude: 37.78825,
        longitude: -122.4324
      },
      regionRadius: {
        latitudeDelta: 0.0599, //0.0922
        longitudeDelta: 0.009 //0.0421
      },
      title: "default",
      description: "please provide"
    };
  }

  componentDidMount() {
    let uniqueId = DeviceInfo.getUniqueID();
    let deviceId = DeviceInfo.getDeviceId();

    this.setState({ deviceId: deviceId + uniqueId });

    this.onPressRequestPermission();

    FCM.getFCMToken().then(token => {
      FCM.subscribeToTopic("/topics/userlist");
      console.log(token);
      //Actions.storefcm({ userId: currentUser._id, fcmToken: token });
    });
  }

  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Cool Location Tracker app",
          message:
            "Cool location tracker app  " + "requires location to track you."
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the locations");
        return true;
      } else {
        console.log("Camera permission denied");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  async checkPermission() {
    try {
      let granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      let checker = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.GET_ACCOUNTS
      );

      console.log(checker);
      console.log(granted);
      return granted;
    } catch (e) {
      console.log(e);
    }
  }

  updateLocationToServer(body, url) {
    let obj = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    };

    fetch(appUrl + url, obj)
      .then(function(response) {
        setTimeout(() => null, 5); // this  is the workaround data not loading fast enough
        ToastAndroid.show("thank you", ToastAndroid.SHORT);
      })
      .catch(error => {
        ToastAndroid.show("something went wrong", ToastAndroid.SHORT);
      });
  }

  addLocation(data) {
    let region = this.state.region;
    region.latitude = data.coords.latitude;
    region.longitude = data.coords.longitude;
    this.setState({
      region: region,
      title: "Current Place",
      description: "Thank you providing"
    });

    let body = {
      deviceId: this.state.deviceId,
      coordintes: {
        latitude: data.coords.latitude,
        longitude: data.coords.longitude
      }
    };
    this.updateLocationToServer(body, "updateUserLocation");
  }

  onPressRequestPermission = () => {
    this.checkPermission().then(result => {
      if (result) {
        try {
          Geolocation.getCurrentPosition(
            data => {
              this.addLocation(data);
            },
            error => {
              // See error code charts below.
              console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } catch (e) {
          console.log(e);
        }
      } else if (!result) {
        this.requestLocationPermission().then(permissionStatus => {
          if (permissionStatus) {
            Geolocation.getCurrentPosition(
              data => {
                console.log(data);
                this.addLocation(data);
              },
              error => {
                // See error code charts below.
                console.log(error.code, error.message);
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000
              }
            );
          } else ToastAndroid.show("requires permission", ToastAndroid.SHORT);
        });
      } /* else if (result == PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          ToastAndroid.show(
            "enable permission from settings",
            ToastAndroid.SHORT
          );
        } else {
          let permissionStatus = this.requestLocationPermission();
          if (permissionStatus) {
            navigator.geolocation.getCurrentPosition(
              data => {
                console.log(data);
                let region = this.state.region;
                region.latitude = data.coords.latitude;
                region.longitude = data.coords.longitude;
                this.setState({
                  region: region,
                  title: "Current Place",
                  description: "Thank you providing"
                });
              },
              { enableHighAccuracy: false, timeout: 15000, maximumAge: 3600000 }
            );
          } else ToastAndroid.show("requires permission", ToastAndroid.SHORT);
        } */
    });
  };

  render() {
    const SPACE = 0.01;
    return (
      <View style={styles.container}>
        <View style={{ height: height * 0.65 }}>
          <View style={styles.container}>
            <MapView
              style={styles.map}
              region={{
                ...this.state.region,
                ...this.state.regionRadius
              }}
            >
              <Marker
                coordinate={{
                  latitude: this.state.region.latitude,
                  longitude: this.state.region.longitude
                }}
                title={this.state.title}
                description={this.state.description}
              />
            </MapView>
          </View>
        </View>

        <View>
          <View style={{ paddingTop: 50, marginHorizontal: 0.2 * width }}>
            <Button
              onPress={this.onPressRequestPermission}
              title="Read Location"
              color="#841584"
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },
  container: {
    height: height * 0.65,
    width: width
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
