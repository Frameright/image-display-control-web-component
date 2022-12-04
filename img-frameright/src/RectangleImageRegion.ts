import { PositionInPixels } from './PositionInPixels.js';
import { SizeInPixels } from './SizeInPixels.js';

export interface ImageRegionFromHtmlAttr {
  id?: string;
  shape?: string;
  absolute?: boolean;
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
}

export class RectangleImageRegion {
  constructor(id?: string) {
    if (id) {
      this.id = id;
      this._unknown = false;
    }
  }

  // Sets the fields according to the values coming from HTML attributes. The
  // provided position and size may be absolute, i.e. expressed in pixels, or
  // relative, i.e. expressed as a fraction of a given base size.
  setFields(values: ImageRegionFromHtmlAttr, baseSize: SizeInPixels) {
    if (
      values.shape == null ||
      values.absolute == null ||
      values.x == null ||
      values.y == null ||
      values.width == null ||
      values.height == null
    ) {
      this._unknown = true;
      return;
    }

    if (values.shape.toLowerCase() !== 'rectangle') {
      this._unknown = true;
      return;
    }

    let x: number = parseFloat(`${values.x}`);
    let y: number = parseFloat(`${values.y}`);
    let width: number = parseFloat(`${values.width}`);
    let height: number = parseFloat(`${values.height}`);
    if (
      Number.isNaN(x) ||
      Number.isNaN(y) ||
      Number.isNaN(width) ||
      Number.isNaN(height)
    ) {
      this._unknown = true;
      return;
    }

    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      this._unknown = true;
      return;
    }

    if (!values.absolute) {
      if (baseSize.isUnknown()) {
        this._unknown = true;
        return;
      }
      x *= baseSize.getWidth();
      y *= baseSize.getHeight();
      width *= baseSize.getWidth();
      height *= baseSize.getHeight();
    }

    this.id = values.id ?? window.crypto.randomUUID();
    this.position = new PositionInPixels(x, y);
    this.size = new SizeInPixels(width, height);
    this._unknown = false;
  }

  isUnknown() {
    return this._unknown;
  }

  id = '';
  position = new PositionInPixels();
  size = new SizeInPixels();

  _unknown = true;
}
