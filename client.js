const ScreenShot = require('./screen-shot');

const initWebSocket = (screenShot) => {
  const ws = new WebSocket('ws://192.168.202.34:9000');
  ws.onopen = () => {
    console.log('onopen');
  };

  ws.onclose = () => {
    console.log('onclose');
    screenShot.stop();

    // 断开重连
    setTimeout(() => {
      initWebSocket(screenShot);
    }, 1000 * 10);
  };

  ws.onmessage = (event) => {
    console.log(event.data);
    if (event.data === 'screen-shot-play') {
      screenShot.play(ws);
    } else if (event.data === 'screen-shot-stop') {
      screenShot.stop();
    } else if (event.data === 'hardware-info') {
      require('getmac').getMac((err, macAddress) => {
        const json = {type: 'hardware-info', width: screen.width, height: screen.height};
        if (!err) {
          json.mac = macAddress;
        }
        ws.send(JSON.stringify(json));
      });
    }
  }
};

initWebSocket(new ScreenShot());