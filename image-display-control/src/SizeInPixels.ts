import { SizeInRelativeCoord } from './SizeInRelativeCoord.js';

export class SizeInPixels {
  // Negative values aren't allowed.
  constructor(width?: number, height?: number) {
    if (width == null || height == null) {
      return;
    }

    // Making sure values are positive:
    this._width = Math.max(width, 0);
    this._height = Math.max(height, 0);
    this._unknown = false;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  // Returns non-zero width, so it's always safe to divide by it.
  getSafeWidth() {
    return Math.max(this._width, 1);
  }

  // Returns non-zero height, so it's always safe to divide by it.
  getSafeHeight() {
    return Math.max(this._height, 1);
  }

  // Returns non-zero ratio, so it's always safe to divide by it.
  getSafeRatio() {
    return this.getSafeWidth() / this.getSafeHeight();
  }

  // Returns a new size multiplied by the given positive factor.
  getScaled(factor: number): SizeInPixels {
    if (this.isUnknown()) {
      return new SizeInPixels();
    }

    const newWidth = this._width * factor;
    const newHeight = this._height * factor;
    return new SizeInPixels(newWidth, newHeight);
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
    const firstRatio = this.getSafeRatio();
    const secondRatio = other.getSafeRatio();
    return firstRatio >= secondRatio
      ? firstRatio / secondRatio
      : secondRatio / firstRatio;
  }

  getRelativeCoord(baseSize: SizeInPixels): SizeInRelativeCoord {
    if (baseSize.isUnknown()) {
      return new SizeInRelativeCoord();
    }

    return new SizeInRelativeCoord(
      this._width / baseSize.getSafeWidth(),
      this._height / baseSize.getSafeHeight()
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
  private _width = 0; // px
  private _height = 0; // px
}
