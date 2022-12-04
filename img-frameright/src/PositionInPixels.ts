export class PositionInPixels {
  constructor(x?: number, y?: number) {
    // Making sure we don't store negative numbers:
    if (x) {
      this._x = Math.max(x, 0);
    }
    if (y) {
      this._y = Math.max(y, 0);
    }
  }

  getX() {
    return this._x;
  }

  getY() {
    return this._y;
  }

  toString() {
    return `{x=${this._x.toFixed(3)}px, y=${this._y.toFixed(3)}px}`;
  }

  private _x = 0; // px
  private _y = 0; // px
}
