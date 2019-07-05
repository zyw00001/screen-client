const {desktopCapturer} = require('electron');
const ImageSlice = require('./image-slice');

const FPS = 24;

class ScreenShot {
  constructor() {
    this._ws = null;
    this._play = false;
    this._timerId = null;
    this._screenSize = {width: screen.width, height: screen.height};
    this._imageSlice = new ImageSlice(this._screenSize.width, this._screenSize.height);
    this._previous = null;
    this._discardCount = screen.width * screen.height * 3 * 2;
    this._discard = false;
  }

  // 开始截屏
  play(ws) {
    if (this._play || !ws) {
      return;
    }

    this._ws = ws;
    this._play = true;
    this._previous = null;
    this._discard = false;
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
    this._previous = null;
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
      if (this._discard || this._ws.bufferedAmount < this._discardCount) {
        const diff = this._imageSlice.diff(img, this._previous);
        this._discard = false;
        this._previous = img;
        this._imageSlice.getSlices(img, diff).forEach((imgSlice) => {
          this._ws.send(new Uint8Array(imgSlice));
        });
      } else {
        this._discard = true;
        console.log('discard');
      }
    }
  }
}

module.exports = ScreenShot;