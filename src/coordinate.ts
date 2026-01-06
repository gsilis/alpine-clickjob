export class Coordinate {
  static from(x: number, y: number) {
    return new Coordinate(x, y)
  }

  private _x: number
  private _y: number

  get x() { return this._x }
  get y() { return this._y }

  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  moveTo(x: number | undefined, y: number | undefined) {
    if (x !== undefined) this._x = x
    if (y !== undefined) this._y = y
  }
}