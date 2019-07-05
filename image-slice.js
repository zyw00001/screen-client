
class ImageSlice {
  constructor(width, height) {
    this.width = width;
    this.heigth = height;
    this.sliceWidthCount = 8;
    this.sliceHeightCount = 4;
    this.sliceCount = this.sliceWidthCount * this.sliceHeightCount;
    this.sliceWidth = Math.floor(width / this.sliceWidthCount);
    this.sliceHeight = Math.floor(height / this.sliceHeightCount);
    this.bits = 4;
  }

  getOffset(index, y) {
    const y1 = Math.floor(index / this.sliceWidthCount) * this.sliceHeight;
    const o1 = (y1 + y) * this.width;
    const o2 = (index % this.sliceWidthCount) * this.sliceWidth;
    return (o1 + o2) * this.bits;
  };

  getSlice(img, index, appendIndex=true) {
    if (index < 0 || index >= this.sliceCount) {
      return null;
    } else {
      const imgBuf = img.getBitmap();
      const buf = new Buffer.allocUnsafe(this.sliceWidth * this.sliceHeight * this.bits + (appendIndex ? 4 : 0));
      for (let y = 0; y < this.sliceHeight; y++) {
        const offset = this.getOffset(index, y);
        imgBuf.copy(buf, y * this.sliceWidth * this.bits, offset, offset + this.sliceWidth * this.bits);
      }
      if (appendIndex) {
        const offset = this.sliceWidth * this.sliceHeight * this.bits;
        buf[offset] = index;
        buf[offset + 1] = 0;
        buf[offset + 2] = 0;
        buf[offset + 3] = 0;
      }
      return buf;
    }
  }

  getSlices(img, arr, compress=true) {
    const result = [];
    arr.forEach(index => {
      const slice = this.getSlice(img, index, !compress);
      if (slice) {
        if (compress) {
          const buf = Buffer.allocUnsafe(slice.byteLength * 3 / this.bits + 4);
          const length = slice.byteLength - 4;
          for (let from = 0, to = 0; from < length; from += 4, to += 3) {
            buf[to] = slice[from];
            buf[to + 1] = slice[from + 1];
            buf[to + 2] = slice[from + 2];
          }
          const offset = this.sliceWidth * this.sliceHeight * 3;
          buf[offset] = index;
          buf[offset + 1] = 0;
          buf[offset + 2] = 0;
          buf[offset + 3] = 0;
          result.push(buf);
        } else {
          result.push(slice);
        }
      }
    });
    return result;
  }

  diff(img1, img2) {
    const result = [];
    if (img2) {
      for (let index = 0; index < this.sliceCount; index++) {
        if (!this.getSlice(img1, index, false).equals(this.getSlice(img2, index, false))) {
          result.push(index);
        }
      }
    } else {
      for (let index = 0; index < this.sliceCount; index++) {
        result.push(index);
      }
    }
    return result;
  }
}

module.exports = ImageSlice;