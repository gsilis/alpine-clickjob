import type { LoopRegistrant } from "./loopable";
import { WraparoundNumber } from "./wraparound-number";

export class LoopDelay {
  static create(registrant: LoopRegistrant, delay: number) {
    return new LoopDelay(registrant, delay)
  }

  private _registrant: LoopRegistrant
  private _accumulator: WraparoundNumber
  private _callback: LoopRegistrant

  constructor(registrant: LoopRegistrant, delay: number) {
    this._registrant = registrant
    this._accumulator = new WraparoundNumber(delay, 0)
    this._callback = (time: number) => {
      const passed = this._accumulator.add(time)

      if (passed > 0) this._registrant.call(undefined, passed)
    }
  }

  get callback(): LoopRegistrant {
    return this._callback
  }
}