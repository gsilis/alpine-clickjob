export class Progression {
  private _base: number
  private _current: number
  private _increase: number

  constructor(base: number, increase: number) {
    this._base = base
    this._current = this._base
    this._increase = increase
  }

  next(): number {
    const old = this._current
    this._current *= this._increase
    return old
  }
}