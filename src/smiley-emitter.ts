import { animate } from "motion";
import { Coordinate } from "./coordinate";
import { randomPoint, randomWholeBetween } from "./random";
import { Rectangle } from "./rectangle";
import type { Renderable, Renderer } from "./renderer";

export class Helper implements Renderable {
  private _red: number
  private _green: number
  private _blue: number
  private _dimensions: Rectangle

  constructor(red: number, green: number, blue: number, dimensions: Rectangle) {
    this._red = red
    this._green = green
    this._blue = blue
    this._dimensions = dimensions
  }

  render(context: CanvasRenderingContext2D): void {
    const existingFill = context.fillStyle
    const existingStroke = context.strokeStyle

    context.fillStyle = `rgba(${this._red}, ${this._green}, ${this._blue}, 0.5)`
    context.strokeStyle = `rgba(${this._red}, ${this._green}, ${this._blue}, 0.5)`
    context.fillRect(this._dimensions.startx, this._dimensions.starty, this._dimensions.width, this._dimensions.height)
    context.fillStyle = existingFill
    context.strokeStyle = existingStroke
  }
}

class Smiley implements Renderable {
  private _x: number
  private _y: number
  private _opacity: number
  private _char: string

  get opacity() { return this._opacity }
  set opacity(val: number) { this._opacity = val }
  get x() { return this._x }
  set x(val: number) { this._x = val }
  get y() { return this._y }
  set y(val: number) { this._y = val }

  constructor(x: number, y: number, char: string) {
    this._opacity = 1
    this._x = x
    this._y = y
    this._char = char
  }

  render(context: CanvasRenderingContext2D): void {
    context.font = '75px serif'
    context.fillStyle = `rgba(0, 0, 0, ${this.opacity})`
    context.fillText(this._char, this.x, this.y)
  }
}

export class SmileyEmitter {
  private renderer: Renderer
  private rectangle: Rectangle

  constructor(renderer: Renderer, rectangle: Rectangle) {
    this.renderer = renderer
    this.rectangle = rectangle
  }

  emit(glyph: string) {
    const point = randomPoint(this.rectangle)
    const to = Coordinate.from(
      randomWholeBetween(point.x - 100, point.x + 50),
      randomWholeBetween(point.y - 450, point.y - 600)
    )
    const smiley = new Smiley(point.x, point.y, glyph)
    const id = this.renderer.add(smiley)
    animate(smiley, { x: to.x, y: to.y, opacity: 0 }, { duration: 1 }).then(() => {
      this.renderer.remove(id)
    })
  }
}