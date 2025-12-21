export const NORMAL_MULTIPLIER = 'normal'

type MultiplierReport = {
  total: number,
  breakdown: Record<string, number>
}

export class Multipliers {
  private _multipliers: Record<string, number> = {}

  add(name: string, value: number) {
    this._multipliers[name] = this._multipliers[name] || 0
    this._multipliers[name] += value
  }

  calculate(baseValue: number): MultiplierReport {
    const report: MultiplierReport = {
      total: baseValue,
      breakdown: {}
    }

    Object.keys(this._multipliers).forEach((key: string) => {
      const multiplier = this._multipliers[key] || 0
      const value = baseValue * multiplier
      report.breakdown[key] = value
      report.total += value
    })

    return report
  }
}