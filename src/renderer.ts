import { IdGenerator } from "./id-generator"

export interface Renderable {
  render(context: CanvasRenderingContext2D): void
}

export class Renderer {
  private _canvas: HTMLCanvasElement
  private _objects: Record<string, Renderable> = {}
  private _ids: IdGenerator = new IdGenerator()

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas
  }

  add(renderable: Renderable): string {
    const id = this._ids.next()
    this._objects[id] = renderable
    return id
  }

  remove(id: string) {
    delete this._objects[id]
  }

  onLoop() {
    const context = this._canvas.getContext('2d')
    if (context) {
      context.clearRect(0, 0, this._canvas.width, this._canvas.height)
      Object.values(this._objects).forEach(o => o.render.apply(o, [context]))
    }
  }
}