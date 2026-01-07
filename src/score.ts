import { SafeValueFactory } from "./safe-value-factory"

/**
 * Stores the scores generated for all of the products
 */
export class Score {
  private _categories = SafeValueFactory.numericRecord('game.scores', {})

  record(name: string, amount: number) {
    const current = this._categories.value
    this._categories.value = {
      ...current,
      [name]: (current[name] || 0) + amount
    }
  }

  scoreFor(name: string) {
    return this._categories.value[name] || 0
  }

  percentageFor(score: number, total: number) {
    return score / total
  }
}