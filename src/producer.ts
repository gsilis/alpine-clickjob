import { Multipliers } from "./multipliers"
import { SafeValue } from "./safe-value"

export class Producer {
  private _priceMultiplier: SafeValue<number>
  private _name: string
  private _title: string
  private _basePrice: number
  private _quantity: SafeValue<number>
  private _productivity: number
  private _revealed: SafeValue<number>
  private _available: SafeValue<number>
  private _multipliers: Multipliers

  constructor(
    priceMultiplier: SafeValue<number>,
    name: string,
    title: string,
    basePrice: number,
    defaultProductivityPerSecond: number
  ) {
    this._priceMultiplier = priceMultiplier
    this._name = name
    this._title = title
    this._basePrice = basePrice
    this._productivity = defaultProductivityPerSecond
    this._quantity = new SafeValue(`${name}.quantity`, 0, parseInt)
    this._revealed = new SafeValue(`${name}.revealed`, 0, parseInt)
    this._available = new SafeValue(`${name}.available`, 0, parseInt)
    this._multipliers = new Multipliers()
  }

  get name(): string {
    return this._name
  }

  get title():string {
    return this._title
  }

  get basePrice(): number {
    return this._basePrice
  }

  get mysterious(): boolean {
    return this.revealed && !this.available
  }

  get revealed(): boolean {
    return this._revealed.value === 1 ? true : false
  }

  set revealed(val: boolean) {
    this._revealed.value = val === true ? 1 : 0
  }

  get available(): boolean {
    return this._available.value === 1 ? true : false
  }

  set available(val: boolean) {
    this._available.value = val === true ? 1 : 0
  }

  get quantity() {
    return this._quantity.value
  }

  set quantity(value: number) {
    this._quantity.value = value
  }

  get productivity(): number {
    return this._productivity
  }

  set productivity(value: number) {
    this._productivity = value
  }

  get price(): number {
    return this._basePrice * Math.pow(this._priceMultiplier.value, this._quantity.value)
  }

  get displayPrice(): number {
    return Math.ceil(this.price)
  }

  buyPriceFor(quantity: number): number {
    const prices: number[] = []
    while (prices.length < quantity) {
      const offset = prices.length
      const multiplier = Math.pow(this._priceMultiplier.value, this._quantity.value + offset)
      prices.push(this._basePrice * multiplier)
    }

    return prices.reduce((sum, val) => sum + val, 0)
  }

  sellPriceFor(quantity: number): number {
    const actual = Math.min(quantity, this.quantity)
    const prices: number[] = []
    while (prices.length < actual) {
      const offset = actual - prices.length
      const multiplier = Math.pow(this._priceMultiplier.value, this._quantity.value - offset)
      prices.push(this._basePrice * multiplier)
    }

    return prices.reduce((sum, val) => sum + val, 0) * 0.3
  }
}