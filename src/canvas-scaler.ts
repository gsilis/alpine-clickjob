import { FriendlyResizeObserver } from "./friendly-resize-observer"
import type { Rectangle } from "./rectangle"

export class CanvasScaler {
  static fromCanvas(canvas: HTMLCanvasElement) {
    return new CanvasScaler(canvas)
  }

  private _canvas: HTMLCanvasElement
  private _observer: FriendlyResizeObserver

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas

    if (!this._canvas.parentElement) {
      throw new Error('Canvas element should have a parent element that can be observed.')
    }

    this._observer = new FriendlyResizeObserver(this._canvas.parentElement)
    this._observer.listen(this.onResize.bind(this))
  }

  private onResize(dimensions: Rectangle) {
    this._canvas.width = dimensions.width
    this._canvas.height = dimensions.height
  }
}