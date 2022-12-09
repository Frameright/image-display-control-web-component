import { SizeInPixels } from './SizeInPixels.js';

export class SizeInRelativeCoord {
  // width and height are in the range [0, 1] and express a size relative to a
  // base size in pixels.
  constructor(width?: number, height?: number) {
    this._width = Math.max(Math.min(width ?? 0, 1), 0);
    this._height = Math.max(Math.min(height ?? 0, 1), 0);
  }

  getSizeInPixels(baseSize: SizeInPixels): SizeInPixels {
    let baseWidth = 0;
    let baseHeight = 0;
    if (!baseSize.isUnknown()) {
      baseWidth = baseSize.getWidth();
      baseHeight = baseSize.getHeight();
    }
    return new SizeInPixels(this._width * baseWidth, this._height * baseHeight);
  }

  toString() {
    return `{width=${this._width.toFixed(3)}, height=${this._height.toFixed(
      3
    )}}`;
  }

  private _width: number;
  private _height: number;
}
