import { SizeInRelativeCoord } from './SizeInRelativeCoord.js';

export class SizeInPixels {
  // Only 1px and more are allowed.
  constructor(width?: number, height?: number) {
    if (width == null || height == null) {
      return;
    }

    // Making sure that non of these values can be 0, so it's safe to divide
    // anything by them.
    this._width = Math.max(width, 1);
    this._height = Math.max(height, 1);
    this._unknown = false;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  getRatio() {
    return this._width / this._height;
  }

  isUnknown() {
    return this._unknown;
  }

  // Sets to the new values and returns true if the values have actually
  // changed.
  setIfDifferent(newValues: SizeInPixels): boolean {
    if (this.equals(newValues)) {
      return false;
    }
    this._unknown = newValues.isUnknown();
    this._width = newValues.getWidth();
    this._height = newValues.getHeight();
    return true;
  }

  // Calculates the difference between two image ratios, expressed as the
  // factor >= 1, so that one ratio multiplied by this factor gives the other
  // ratio.
  ratioDiffFactor(other: SizeInPixels) {
    const firstRatio = this.getRatio(); // > 0
    const secondRatio = other.getRatio(); // > 0
    return firstRatio >= secondRatio
      ? firstRatio / secondRatio
      : secondRatio / firstRatio;
  }

  getRelativeCoord(baseSize: SizeInPixels): SizeInRelativeCoord {
    if (baseSize.isUnknown()) {
      return new SizeInRelativeCoord();
    }

    // SizeInPixels can't have zero width or height, so we're sure we won't
    // devide by zero:
    return new SizeInRelativeCoord(
      this._width / baseSize.getWidth(),
      this._height / baseSize.getHeight()
    );
  }

  toString() {
    return `{width=${this._width.toFixed(3)}px, height=${this._height.toFixed(
      3
    )}px}`;
  }

  equals(other: SizeInPixels) {
    return (
      this._width === other.getWidth() && this._height === other.getHeight()
    );
  }

  private _unknown = true;
  private _width = 1; // px
  private _height = 1; // px
}
