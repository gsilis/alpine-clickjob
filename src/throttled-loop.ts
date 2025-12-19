import type { Loopable, LoopRegistrant } from "./loopable";
import { WraparoundNumber } from "./wraparound-number";

export class ThrottledLoop implements Loopable {
  private _wrapped: Loopable
  private _wraparoundNumber: WraparoundNumber

  constructor(wrapped: Loopable, target: number) {
    this._wrapped = wrapped
    this._wraparoundNumber = new WraparoundNumber(target, 0)
  }

  add(registrant: LoopRegistrant) {
    return this._wrapped.add(registrant)
  }

  remove(registrant: LoopRegistrant) {
    return this._wrapped.remove(registrant)
  }

  start() {
    return this._wrapped.start()
  }

  stop() {
    return this._wrapped.stop()
  }

  onFrame(time: number): void {
    const passedTime = this._wraparoundNumber.add(time)

    if (passedTime > 0) this._wrapped.onFrame(passedTime)
  }

  get isRunning() {
    return this._wrapped.isRunning
  }
}