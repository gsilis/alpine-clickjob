import { Producer } from "./producer";
import type { SafeValue } from "./safe-value";

export class ProducerFactory {
  private _price: SafeValue<number>

  constructor(multiplier: SafeValue<number>) {
    this._price = multiplier
  }

  create(name: string, title: string, basePrice: number, defaultProductivity: number): Producer {
    const producer = new Producer(this._price, name, title, basePrice, defaultProductivity)
    return producer
  }
}