const ScreenShot = require('./screen-shot');

const initWebSocket = (screenShot) => {
  const ws = new WebSocket('ws://192.168.202.34:9000');
  ws.onopen = () => {
    console.log('onopen');
  };

  ws.onclose = () => {
    console.log('onclose');
    screenShot.stop();
  };

  ws.onmessage = (event) => {
    console.log(event.data);
    if (event.data === 'screen-shot-play') {
      screenShot.play(ws);
    } else if (event.data === 'screen-shot-stop') {
      screenShot.stop();
    }
  }
};

initWebSocket(new ScreenShot());