/**
 * Stores the scores generated for all of the products
 */
export class Score {
  private _products: Record<string, number> = {
    manual: 0
  }

  get scores(): Record<string, number> {
    return this._products
  }

  record(name: string, amount: number) {
    if (this._products[name] === undefined) this._products[name] = 0
    this._products[name] += amount
  }
}