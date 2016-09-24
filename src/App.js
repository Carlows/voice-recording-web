import React, { Component } from 'react';
import classNames from 'classnames';
import Recorder from './recorder.js';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      recording: false,
      error: false
    };

    this.toggleRecord = this.toggleRecord.bind(this);
    this.handleError = this.handleError.bind(this);
    this.getAudio = this.getAudio.bind(this);
  }

  toggleRecord() {
    const { recording } = this.state;

    if (recording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }

    this.setState({ recording: !recording });
  }

  startRecording() {
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ audio: true }, this.getAudio, this.handleError);
    }
  }

  getAudio(response) {
    let context = new AudioContext();
    let mediaStreamSource = context.createMediaStreamSource(response);
    this.mediaStream = response;
    this.recorder = new Recorder(mediaStreamSource);
    this.recorder.record();
  }

  handleError(error) {
    this.setState({ error: true });
  }

  stopRecording() {
    const control = this.refs.control;

    this.mediaStream.getAudioTracks()[0].stop();

    this.recorder.stop();
    this.recorder.exportWAV((stream) => {
      control.src = window.URL.createObjectURL(stream);
    });
  }

  render() {
    const { recording, error } = this.state;

    const btnText = recording ? 'STOP' : 'RECORD';
    const classesBtn = classNames({ 'recording': recording });

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Voice Recording Demo</h2>
        </div>
        <div className="App-content">
          <div>
            <audio ref='control' controls autoPlay></audio>
          </div>
          <div>
            <button disabled={error} className={classesBtn} onClick={this.toggleRecord}>{btnText}</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
