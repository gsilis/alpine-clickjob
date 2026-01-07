export class CanvasScaler {
  static fromCanvas(canvas: HTMLCanvasElement) {
    return new CanvasScaler(canvas)
  }

  private _canvas: HTMLCanvasElement
  private _parent?: HTMLElement
  private _observer: ResizeObserver

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas
    this._observer = new ResizeObserver(this.onResize.bind(this))

    if (!this._canvas.parentElement) {
      throw new Error('Canvas element should have a parent element that can be observed.')
    }

    this._parent = this._canvas.parentElement
    this._observer.observe(this._parent)
  }

  private onResize() {
    if (!this._parent) return
    this._canvas.width = this._parent.clientWidth
    this._canvas.height = this._parent.clientHeight
  }
}