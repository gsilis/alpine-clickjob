import { Coordinate } from "./coordinate"
import type { Rectangle } from "./rectangle"

export function randomWholeBetween(a: number, b: number): number {
  const min = Math.min(a, b)
  const max = Math.max(a, b)
  const diff = max - min
  const rando = Math.random()

  return min + Math.round(diff * rando)
}

export function randomPoint(rectangle: Rectangle): Coordinate {
  return Coordinate.from(
    randomWholeBetween(rectangle.startx, rectangle.endx),
    randomWholeBetween(rectangle.starty, rectangle.endy)
  )
}

export function randomItemFrom<T>(collection: T[]): T {
  const index = randomWholeBetween(0, collection.length - 1)

  return collection[index]
}