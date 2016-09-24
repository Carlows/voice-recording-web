# Goals

- Entender como funciona voice recording en el navegador
- Ser capacez de pedir al usuario el acceso al microfono de su PC
- Grabar la voz del usuario
- Ser capacez de hacer playback de lo que grabó el usuario

## Hackaton results

Luego de algo de tiempo logré hacer setup de un react component que nos permite cumplir con todos los goals que tenemos, comencé utilizando [create-react-app](https://github.com/facebookincubator/create-react-app) para hacer el quickstart de la aplicacion más rápido.

Para pedirle al usuario el acceso a video/audio utilizamos el siguiente metodo:

```javascript
if (navigator.getUserMedia) {
  navigator.getUserMedia({ audio: true }, this.getAudio, this.handleError);
}
```

Si el usuario nos da acceso, podemos tener acceso al stream en tiempo real de lo que sea que se escucha en su microfono. Nuestro problema es que tenemos un raw streamMedia que tendriamos que convertir a WAV (o MP3, ogg, etc) manualmente.

Ya que no es algo que quisieramos hacer nosotros, encontré [recorderjs](https://github.com/mattdiamond/Recorderjs) una libreria que nos permite convertir el audio en ese stream media que obtenemos al formato que queramos.

```javascript
this.recorder.exportWAV((stream) => {
  control.src = window.URL.createObjectURL(stream);
});
```

La implementación del componente completo se ve así:

```javascript
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
```

Un hint para un próximo avance en esto es que la función exportWAV nos da un blob de la data que tenemos en el Stream, y podemos usarla para guardarla en el servidor

```javascript
recorder.stop();
recorder.exportWAV(function(audio) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("content-type", "audio/wav");
    xhr.onload = function(e) {
        // Handle the response.
    }
    xhr.send(audio);
});
```

Demo screencast:

https://www.opentest.co/share/8ea3ee8082ad11e69dae210557c9fab3