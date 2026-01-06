import type { Coordinate } from "./coordinate";

export class Rectangle {
  private a: Coordinate
  private b: Coordinate

  constructor(a: Coordinate, b: Coordinate) {
    this.a = a
    this.b = b
  }

  get width() {
    const min = Math.min(this.a.x, this.b.x)
    const max = Math.max(this.a.x, this.b.x)

    return max - min
  }

  get height() {
    const min = Math.min(this.a.y, this.b.y)
    const max = Math.max(this.a.y, this.b.y)

    return max - min
  }

  moveTo(point: Coordinate) {
    const width = this.width
    const height = this.height

    this.a.moveTo(point.x, point.y)
    this.b.moveTo(point.x + width, point.y + height)
  }
}