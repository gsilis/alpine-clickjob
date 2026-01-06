import type { Game } from "./game";
import { Multipliers } from "./multipliers";
import type { Producer } from "./producer";
import type { Score } from "./score";

const THOUSANDTH = 1 / 1000
const formatter = new Intl.NumberFormat('en-us', { maximumFractionDigits: 1 })

export class Producers {
  private _null: Producer
  private _score: Score
  private _overallProductivityPerSecond: number
  private _overallProductivityPerSecondMS: number
  private _epmsStats: Record<string, number> = {}
  private _epsStats: Record<string, number> = {}
  private _earnedStats: Record<string, number> = {}
  private _multipliers: Multipliers = new Multipliers()
  private producers: Producer[] = []

  constructor(nullProducer: Producer, score: Score) {
    this._null = nullProducer
    this._overallProductivityPerSecond = 0
    this._overallProductivityPerSecondMS = 0
    this._score = score
  }

  all() {
    return this.producers
  }

  increase(id: string, rate: number) {
    this._multipliers.add(id, (_game: Game, _producers: Producers, baseValue: number) => rate)
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
    return formatter.format(this.overallProductivity)
  }

  get availableProducers() {
    return this.producers.filter(p => p.available)
  }

  get hasAvailableProducers() {
    return this.availableProducers.length > 0
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

    const producersValue = Object.values(this._epsStats).reduce((sum, val) => sum + val, 0)
    const report = this._multipliers.calculate(game, this, 1)
    this.overallProductivity = producersValue * report.total
  }

  advance(byTime: number) {
    Object.keys(this._epmsStats).forEach(name => {
      const amount = (this._epmsStats[name] * byTime)
      this._earnedStats[name] += amount
      this._score.record(name, amount)
    })
  }

  find(name: string): Producer {
    return this.producers.find(p => p.name === name) || this._null
  }

  epsFor(name: string): number {
    return this._epsStats[name] || 0
  }
}