import { PositionInRelativeCoord } from './PositionInRelativeCoord.js';
import { SizeInPixels } from './SizeInPixels.js';

export class PositionInPixels {
  // Negative values are allowed.
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getRelativeCoord(baseSize: SizeInPixels): PositionInRelativeCoord {
    if (baseSize.isUnknown()) {
      return new PositionInRelativeCoord();
    }

    return new PositionInRelativeCoord(
      this.x / baseSize.getSafeWidth(),
      this.y / baseSize.getSafeHeight(),
    );
  }

  toString() {
    return `{x=${this.x.toFixed(3)}px, y=${this.y.toFixed(3)}px}`;
  }

  public x: number; // px
  public y: number; // px
}
