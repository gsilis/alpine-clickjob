export interface Renderable {
  render(context: CanvasRenderingContext2D): void
}

export class Renderer {
  private _canvas: HTMLCanvasElement
  private _objects: Renderable[] = []

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas
  }

  add(renderable: Renderable) {
    this._objects.push(renderable)
  }

  remove(renderable: Renderable) {
    this._objects = this._objects.filter(o => o !== renderable)
  }

  onLoop() {
    const context = this._canvas.getContext('2d')
    if (context) this._objects.forEach(o => o.render(context))
  }
}