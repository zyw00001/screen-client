const {desktopCapturer} = require('electron');

const FPS = 10;

class ScreenShot {
  constructor() {
    this._ws = null;
    this._play = false;
    this._timerId = null;
    this._screenSize = {width: screen.width, height: screen.height};
  }

  // 开始截屏
  play(ws) {
    if (this._play || !ws) {
      return;
    }

    this._ws = ws;
    this._play = true;
    this._timerId = setInterval(() => {
      if (this._play) {
        this._shot();
      }
    }, Math.round(1000 / FPS));
  }

  // 停止截屏
  stop() {
    if (!this._play) {
      return;
    }

    this._play = false;
    this._ws = null;
    clearInterval(this._timerId);
    this._timerId = null;
  }

  // 截取一帧画面
  _shot() {
    desktopCapturer.getSources({types: ['screen'], thumbnailSize: this._screenSize}, (err, sources) => {
      if (!err) {
        this._send(sources[0].thumbnail);
      }
    });
  }

  // 发送屏幕数据
  _send(img) {
    if (this._ws) {
      this._ws.send(new Uint8Array(img.getBitmap()));
    }
  }

  // 对比屏幕数据
  _compare() {

  }
}

module.exports = ScreenShot;