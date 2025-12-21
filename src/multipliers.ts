import type { Game } from "./game"
import type { Producers } from "./producers"

export const NORMAL_MULTIPLIER = 'normal'

export type MultiplierFunction = (game: Game, producers: Producers, baseValue: number) => number
type MultiplierReport = {
  total: number,
  breakdown: Record<string, number>
}

export class Multipliers {
  private _multipliers: Record<string, MultiplierFunction> = {}

  get len(): number {
    return Object.values(this._multipliers).length
  }

  add(id: string, fn: MultiplierFunction) {
    this._multipliers[id] = fn
  }

  calculate(game: Game, producers: Producers, baseValue: number): MultiplierReport {
    const report: MultiplierReport = {
      total: baseValue,
      breakdown: {}
    }

    Object.keys(this._multipliers).forEach((key: string) => {
      const multiplier = this._multipliers[key] || 0
      const value = multiplier.call(undefined, game, producers, baseValue)
      report.breakdown[key] = value
      report.total += value
    })

    return report
  }
}