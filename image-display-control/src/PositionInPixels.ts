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

    // SizeInPixels can't have zero width or height, so we're sure we won't
    // devide by zero:
    return new PositionInRelativeCoord(
      this.x / baseSize.getWidth(),
      this.y / baseSize.getHeight()
    );
  }

  toString() {
    return `{x=${this.x.toFixed(3)}px, y=${this.y.toFixed(3)}px}`;
  }

  public x: number; // px
  public y: number; // px
}
