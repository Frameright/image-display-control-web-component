import { PositionInPixels } from './PositionInPixels.js';
import { SizeInPixels } from './SizeInPixels.js';

export class PositionInRelativeCoord {
  // x and y are in the range [0, 1] and express a position relative to a base
  // size in pixels.
  constructor(x?: number, y?: number) {
    this._x = Math.max(Math.min(x ?? 0, 1), 0);
    this._y = Math.max(Math.min(y ?? 0, 1), 0);
  }

  getPositionInPixels(baseSize: SizeInPixels): PositionInPixels {
    let baseWidth = 0;
    let baseHeight = 0;
    if (!baseSize.isUnknown()) {
      baseWidth = baseSize.getWidth();
      baseHeight = baseSize.getHeight();
    }
    return new PositionInPixels(this._x * baseWidth, this._y * baseHeight);
  }

  toString() {
    return `{x=${this._x.toFixed(3)}, y=${this._y.toFixed(3)}}`;
  }

  private _x: number;
  private _y: number;
}
