import React, { Component } from "react";
import "./App.css";

import { Alert, Button, Modal, ModalBody } from "react-bootstrap";

const appUrl = "http://localhost:3001/";

var moment = require("moment");
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      mainAlert: true,
      showModal: false,
      data: []
    };
  }

  serverCall(body, url) {
    return new Promise((resolve, reject) => {
      let obj = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      };

      fetch(url, obj)
        .then(function(response) {
          setTimeout(() => null, 5); // this  is the workaround data not loading fast enough
          response.json().then(function(data) {
            resolve(data);
          });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  closeModal = () => {
    this.setState({ showModal: false });
  };

  getLocationById = data => {
    let body = {
      type: "FETCH_LOCATIONS",
      data: data
    };
    this.serverCall(body, "server/api")
      .then(result => {
        if (result.type == "success") {
          this.setState({ data: result.response, showModal: true });
        }
      })
      .catch(error => console.log(error));
  };

  getDevices = () => {
    console.log("getDevices");
    let body = {
      type: "FETCH_DEVICES"
    };
    this.serverCall(body, "server/api")
      .then(result => {
        if (result.type == "success") {
          this.setState({ devices: result.response });
        }
      })
      .catch(error => console.log(error));
  };

  doNothing = () => {
    console.log("doNothing");
  };

  render() {
    console.log(this.state);
    return (
      <div className="App">
        <ModalLocation
          show={this.state.showModal}
          closeModal={this.closeModal}
          data={this.state.data}
        />

        <MainAlert
          show={this.state.mainAlert}
          action1={this.getDevices}
          action2={this.doNothing}
        />
        <div>
          {this.state.devices &&
            this.state.devices.map((item, index) => (
              <div key={index}>
                {item.deviceId}{" "}
                <a
                  style={{ marginLeft: "20px" }}
                  onClick={() => this.getLocationById(item.deviceId)}
                >
                  check location
                </a>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default App;

const ModalLocation = ({ show, data, closeModal }) => {
  console.log(show);
  if (!show) return <div />;

  return (
    <div className="static-modal">
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>User Locations</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {data.map((item, index) => (
            <div key={index}>
              <span>
                Date= {moment(item.created).format("DD MM YYYY hh:mm a")}
              </span>
              <span style={{ color: "#ff4242" }}>
                {"   "} differenceInKm={item.differenceInKm.toFixed(2)}
              </span>
            </div>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => closeModal()}>Close</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
};

const MainAlert = ({ action1, action2, show }) => {
  if (!show) return <div />;

  return (
    <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
      <div style={{ padding: " 0% 25% 0% 25%" }}>
        <h4>Oh snap!!</h4>
        <p style={{}}>
          Click continue to get all the devices available for tracking the
          locations created to find un authorized usage of transactions dont in
          banking system
        </p>
        <p>
          <Button onClick={action1} bsStyle="danger">
            Continue
          </Button>
          <span> or </span>
          <Button onClick={action2}>Just leave it</Button>
        </p>
      </div>
    </Alert>
  );
};
