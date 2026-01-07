import { Coordinate } from "./coordinate";

export class Rectangle {
  static fromDimensions(x: number, y: number, width: number, height: number) {
    const a = Coordinate.from(x, y)
    const b = Coordinate.from(x + width, y + width)

    return new Rectangle(a, b)
  }

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