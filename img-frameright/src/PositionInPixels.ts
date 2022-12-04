export class PositionInPixels {
  constructor(x?: number, y?: number) {
    this._x = x ?? 0;
    this._y = y ?? 0;
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
