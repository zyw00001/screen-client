const ScreenShot = require('./screen-shot');

class Heart {
  constructor() {
    this.id = null;
  }

  open(ws) {
    if (ws) {
      this.close();
      this.id = setInterval(() => {
        ws.send(JSON.stringify({type: 'heart'}));
      }, 60 * 1000);
    }
  }

  close() {
    if (this.id) {
      clearInterval(this.id);
      this.id = null;
    }
  }
}

const screenShot = new ScreenShot();
const heart = new Heart();

const initWebSocket = () => {
  const ws = new WebSocket('ws://192.168.202.34:9000');
  const time = new Date().getTime();

  ws.onopen = () => {
    console.log('onopen');
    heart.open(ws);
  };

  ws.onclose = () => {
    console.log('onclose');
    heart.close();
    screenShot.stop();

    // 断开重连
    setTimeout(initWebSocket, new Date().getTime() - time > 15000 ? 0 : 10000);
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

initWebSocket();