import { SafeValueFactory } from "./safe-value-factory"

/**
 * Stores the scores generated for all of the products
 */
export class Score {
  private _categories = SafeValueFactory.numericRecord('game.scores', {})
  private _manual = SafeValueFactory.numericRecord('game.manual', {
    clicks: 0,
    manuallyCreated: 0
  })

  createManual(clicks: number, amount: number) {
    const current = this._manual.value
    this._manual.value = {
      ...current,
      clicks: current.clicks += clicks,
      manuallyCreated: current.manuallyCreated + amount
    }
  }

  record(name: string, amount: number) {
    const current = this._categories.value
    this._categories.value = {
      ...current,
      [name]: current[name] + amount
    }
  }
}