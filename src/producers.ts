import type { Game } from "./game";
import type { Producer } from "./producer";

const THOUSANDTH = 1 / 1000

export class Producers {
  private _null: Producer
  private _overallProductivityPerSecond: number
  private _overallProductivityPerSecondMS: number
  private _epmsStats: Record<string, number> = {}
  private _epsStats: Record<string, number> = {}
  private _earnedStats: Record<string, number> = {}
  private producers: Producer[] = []

  constructor(nullProducer: Producer) {
    this._null = nullProducer
    this._overallProductivityPerSecond = 0
    this._overallProductivityPerSecondMS = 0
  }

  all() {
    return this.producers
  }

  get overallProductivityMS(): number {
    return this._overallProductivityPerSecondMS
  }

  get overallProductivity(): number {
    return this._overallProductivityPerSecond
  }

  set overallProductivity(val: number) {
    this._overallProductivityPerSecond = val
    this._overallProductivityPerSecondMS = val * THOUSANDTH
  }

  get displayOverallProductivity() {
    return this.overallProductivity.toFixed(1)
  }

  add(producer: Producer) {
    this.producers.push(producer)
    this._epsStats[producer.name] = 0
    this._epmsStats[producer.name] = 0
    this._earnedStats[producer.name] = 0
  }
  
  recalculate(game: Game) {
    this.producers.forEach((producer) => {
      producer.calculate(game, this)
      const eps = producer.quantity * producer.productivity
      this._epsStats[producer.name] = eps
      this._epmsStats[producer.name] = eps * THOUSANDTH

      if (window.DEBUG) console.log(`${producer.name} -> ${eps} (${this._epmsStats[producer.name]} / ms)`)
    })

    this.overallProductivity = Object.values(this._epsStats).reduce((sum, val) => sum + val, 0)
  }

  advance(byTime: number) {
    Object.keys(this.producers).forEach(name => {
      this._earnedStats[name] += (this._epmsStats[name] * byTime)
    })
  }

  find(name: string): Producer {
    return this.producers.find(p => p.name === name) || this._null
  }
}