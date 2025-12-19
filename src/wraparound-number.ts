/**
 * A utility used for throttling. Define a threshold number and keep
 * adding increments to a register until they exceed the maximum number.
 */
export class WraparoundNumber {
  private _max: number
  private _current: number

  constructor(max: number, start: number = 0) {
    this._max = max
    this._current = start
  }

  /**
   * Returns 0 until the threshold has been crossed
   * Returns the accumulated time once it has
   */
  add(amount: number): number {
    let rolledOver = 0

    this._current += amount
    if (this._current >= this._max) {
      rolledOver = this._current
      this._current = this._current % this._max
    }

    return rolledOver
  }

  get value(): number {
    return this._current
  }
}