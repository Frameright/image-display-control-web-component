export class SizeInPixels {
  constructor(width?: number, height?: number) {
    if (width == null || height == null) {
      return;
    }

    // Making sure that non of these values can be 0, so it's safe to divide
    // anything by them.
    this._width = Math.max(width, 1);
    this._height = Math.max(height, 1);
    this._ratio = width / height;
    this._unknown = false;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  getRatio() {
    return this._ratio;
  }

  isUnknown() {
    return this._unknown;
  }

  toString() {
    return `{width=${this._width.toFixed(3)}px, height=${this._height.toFixed(
      3
    )}px, ratio=${this._ratio.toFixed(3)}}`;
  }

  equals(other: SizeInPixels) {
    return (
      this._width === other.getWidth() && this._height === other.getHeight()
    );
  }

  private _unknown = true;
  private _width = 1; // px
  private _height = 1; // px
  private _ratio = 1;
}
