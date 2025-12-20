import { Balance } from "./balance";
import { Config } from "./config";
import { Loop } from "./loop";
import { LoopDelay } from "./loop-delay";
import type { Producer } from "./producer";
import { ProducerFactory } from "./producer-factory";
import { Producers } from "./producers";
import { SafeValue } from "./safe-value";
import { SafeValueFactory } from "./safe-value-factory";
import { SafeValueManager } from "./safe-value-manager";
import { Score } from "./score";
import { Unlocks, type Unlock } from "./unlocks";

// How often the update loop should run
const RUN_EVERY = 100// ms
// How often checks for effects should be run
const EFFECT_EVERY = 3000// ms

export type Product = { id: string, title: string, description: string, basePrice: number, baseProductivity: number }
export type Upgrade = { id: string, title: string, description: string, effectDescription: string, price: number, unlockAt: number, productId: string }

export class Game {
  private __proxy?: Game;
  private loop = new Loop()
  private config = new Config()
  private score = new Score()
  private manualLabor: SafeValue<number> = new SafeValue('game.manual-labor', 1, parseFloat)
  private balances = new Balance()
  private unlockStorage = SafeValueFactory.stringCollection('game.unlocks', [])
  private unlocks = new Unlocks(this.unlockStorage)
  private producerFactory = new ProducerFactory(this.config.priceMultiplier)
  private producers = new Producers(this.producerFactory.create('null', 'NULL', 0, 0))
  private upgrades = []
  private frameClicks: number = 0

  constructor(products: Product[], upgrades: Upgrade[], unlocks: Unlock[]) {
    products.forEach((product) => {
      this.producers.add(this.producerFactory.create(
        product.id,
        product.title,
        product.basePrice,
        product.baseProductivity
      ))
    })

    upgrades.forEach((upgrade) => {
      
    })

    unlocks.forEach((unlock) => {
      this.unlocks.register(unlock)
    })
  }

  /**
   * This accepts the proxied game object from Alpine, otherwise any updates we do to the data objects won't get picked up by the UI
   */
  setup(game: Game) {
    if (window.DEBUG) console.group('Setting up')
    this.__proxy = game
    this.calculateEPS(game)
    this.unlocks.process(game, game.producers, game.balances)

    game.loop.add(LoopDelay.create(game.onLoop.bind(game), RUN_EVERY).callback)
    game.loop.add(LoopDelay.create(game.onUpdate.bind(game), EFFECT_EVERY).callback)
    game.loop.start()
    if (window.DEBUG) console.groupEnd()
  }

  work() {
    const amount = this.manualLabor.value

    this.score.record('manual', amount)
    this.balances.earn(amount)
    this.frameClicks += 1
  }

  buy(game: Game, producer: Producer, quantity: number) {
    const price = producer.buyPriceFor(quantity)
    if (price > game.balances.balance) return
    game.balances.spend(price)
    producer.quantity += quantity

    this.calculateEPS(game)
  }

  sell(game: Game, producer: Producer, quantity: number) {
    const price = producer.sellPriceFor(quantity)
    game.balances.earn(price)
    producer.quantity = Math.max(0, producer.quantity - quantity)

    this.calculateEPS(game)
  }

  buyUpgrade(game: Game, upgrade: Producer) {
    const price = upgrade.price
    // const application = game.revealables.findApplicationFor(upgrade.name)
    if (price > game.balances.balance) return
    game.balances.spend(price)
    upgrade.available = false

    // if (application) application.call(undefined, game)

    this.calculateEPS(game)
  }

  erase() {
    SafeValueManager.erase()
    window.location.reload()
  }

  pause() {
    this.loop.stop()
  }

  resume() {
    this.loop.start()
  }

  restart() {
    this.pause()
    this.erase()
  }

  get displayManualLaborValue() {
    return this.manualLabor.value.toFixed(1)
  }

  get balance() {
    return this.balances.balance
  }

  get maxBalance() {
    return this.balances.maxBalance
  }

  get proxy() {
    return this.__proxy
  }

  debug() {
    window.DEBUG = !window.DEBUG
    return window.DEBUG ? 'Debug ON' : 'Debug OFF'
  }

  private calculateEPS(game: Game) {
    if (window.DEBUG) console.group('Calculating EPS...')
    game.producers.recalculate()
    if (window.DEBUG) console.groupEnd()
  }

  private onLoop(time: number) {
    const amount = this.producers.overallProductivityMS * time

    this.producers.advance(time)
    this.balances.earn(amount)
  }

  private onUpdate(time: number) {
    const lastFrame = this.frameClicks
    this.frameClicks = 0
    if (window.DEBUG) {
      console.group(`Game update frame after ${time}ms`)
      console.log(...this.outputClickEvents(lastFrame))
    }
    this.unlocks.process(this, this.producers, this.balances)
    if (window.DEBUG) console.groupEnd()
  }

  private outputClickEvents(count: number): string[] {
    const messages: string[] = []

    if (count > 0) {
      messages.push(
        `%c${count}%c click events`,
        'background-color: purple; color: white; padding: 2px 4px',
        'background-color: none; padding: auto'
      )
    } else {
      messages.push('0 click events')
    }

    return messages
  }
}