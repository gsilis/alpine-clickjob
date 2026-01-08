import { Rectangle } from "./rectangle"

export type FriendlyResizeObserverHandler = (rectangle: Rectangle) => void

export class FriendlyResizeObserver {
  private _observer: ResizeObserver
  private _listeners: FriendlyResizeObserverHandler[] = []
  private _dom: HTMLElement

  constructor(dom: HTMLElement) {
    this._dom = dom
    this._observer = new ResizeObserver(this.onResize.bind(this))
    this._observer.observe(this._dom)
  }

  listen(handler: FriendlyResizeObserverHandler) {
    this._listeners.push(handler)
    handler.apply(undefined, [this.dimensions()])
  }

  private onResize() {
    const dimensions = this.dimensions()

    this._listeners.forEach(l => l.apply(undefined, [dimensions]))
  }

  private dimensions() {
    return Rectangle.fromDimensions(0, 0, this._dom.offsetWidth, this._dom.offsetHeight)
  }
}