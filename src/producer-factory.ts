import { Producer } from "./producer";
import type { SafeValue } from "./safe-value";

export class ProducerFactory {
  private _price: SafeValue<number>
  private _sell: SafeValue<number>

  constructor(multiplier: SafeValue<number>, sell: SafeValue<number>) {
    this._price = multiplier
    this._sell = sell
  }

  create(name: string, title: string, basePrice: number, defaultProductivity: number): Producer {
    const producer = new Producer(this._price, this._sell, name, title, basePrice, defaultProductivity)
    return producer
  }
}