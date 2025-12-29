import { Balance } from "./balance";
import { Config } from "./config";
import { Console } from "./console";
import { Loop } from "./loop";
import { LoopDelay } from "./loop-delay";
import { Multipliers, type MultiplierFunction } from "./multipliers";
import type { Producer } from "./producer";
import { ProducerFactory } from "./producer-factory";
import { Producers } from "./producers";
import { Purchases } from "./purchases";
import { SafeValueFactory } from "./safe-value-factory";
import { SafeValueManager } from "./safe-value-manager";
import { Score } from "./score";
import { Unlocks, type Unlock } from "./unlocks";

// How often the update loop should run
const RUN_EVERY = 100// ms
// How often checks for effects should be run
const EFFECT_EVERY = 3000// ms
const priceFormatter = new Intl.NumberFormat('en-us', { maximumFractionDigits: 0 })

export type Product = { id: string, title: string, description: string, basePrice: number, baseProductivity: number }
export type Upgrade = { id: string, title: string, description: string, effectDescription: string, price: number, unlockAt: number, productId?: string, install(game: Game, producers: Producers): void }
export type StoredUpgrade = Upgrade & { available: boolean, displayPrice: string }

export const MODE_PURCHASES = 'purchases'
export const MODE_UPGRADES = 'upgrades'
export const MODE_HISTORY = 'history'
type StoreMode = (typeof MODE_PURCHASES | typeof MODE_UPGRADES | typeof MODE_HISTORY)
export const STORE_MODE_BUY = 'store-buy'
export const STORE_MODE_SELL = 'store-sell'
type StoreTransactionMode = (typeof STORE_MODE_BUY | typeof STORE_MODE_SELL)

export class Game {
  private __proxy?: Game;
  private loop = new Loop()
  private config = new Config()
  private score = new Score()
  private manualLabor = 1
  private _manualLaborMultipliers = new Multipliers()
  private balances = new Balance()
  private unlockStorage = SafeValueFactory.stringCollection('game.unlocks', [])
  private unlocks = new Unlocks(this.unlockStorage)
  private producerFactory = new ProducerFactory(this.config.priceMultiplier, this.config.sellPercentage)
  private producers = new Producers(this.producerFactory.create('null', 'NULL', 0, 0))
  private upgrades: StoredUpgrade[] = []
  private purchases = new Purchases(SafeValueFactory.stringCollection('game.purchases', []))
  private frameClicks: number = 0
  private _storeMode: StoreMode = MODE_PURCHASES
  private _storeTransactMode: StoreTransactionMode = STORE_MODE_BUY

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
      this.upgrades.push({ ...upgrade, available: false, displayPrice: priceFormatter.format(upgrade.price) })
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
    this.unlocks.process(game, game.producers, game.upgrades, game.balances)
    this.processUpgrades(game, game.producers, game.purchases)
    this.calculateEPS(game)

    game.loop.add(LoopDelay.create(game.onLoop.bind(game), RUN_EVERY).callback)
    game.loop.add(LoopDelay.create(game.onUpdate.bind(game), EFFECT_EVERY).callback)
    game.loop.start()
    if (window.DEBUG) console.groupEnd()
  }

  work() {
    const amount = this.manualLabor

    this.score.record('manual', amount)
    this.balances.earn(amount)
    this.frameClicks += 1
  }

  addManualLaborMultiplier(id: string, fn: MultiplierFunction) {
    this._manualLaborMultipliers.add(id, fn)
    this.calculateEPS(this)
  }

  buy(game: Game, producer: Producer, quantity: number) {
    const price = producer.buyPriceFor(quantity)
    if (price > game.balances.balance) return
    game.balances.spend(price)
    producer.quantity += quantity
    if (window.DEBUG) console.log(`%cPURCHASE ITEM%c %c${producer.name}`, Console.EVENT, Console.CLEAR, Console.ID)

    this.calculateEPS(game)
  }

  sell(game: Game, producer: Producer, quantity: number) {
    const price = producer.sellPriceFor(quantity)
    producer.quantity = Math.max(0, producer.quantity - quantity)
    if (window.DEBUG) console.log(`%cSELL ITEM%c %c${producer.name}`, Console.EVENT, Console.CLEAR, Console.ID)

    this.calculateEPS(game)
    game.balances.earn(price)
  }

  buyUpgrade(game: Game, upgrade: StoredUpgrade) {
    const price = upgrade.price
    if (price > game.balances.balance) return
    game.balances.spend(price)
    upgrade.available = false
    upgrade.install(game, game.producers)
    this.purchases.add(upgrade.id)

    if (window.DEBUG) console.log(`%cPURCHASE UPGRADE%c %c${upgrade.id}`, Console.EVENT, Console.CLEAR, Console.ID)
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
    return this.manualLabor.toFixed(1)
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

  get availableUpgrades() {
    return this.upgrades.filter(u => u.available).length
  }

  get storeMode() {
    return this._storeMode
  }

  set storeMode(mode: StoreMode) {
    this._storeMode = mode
  }

  get storeTransactMode() {
    return this._storeTransactMode
  }

  set storeTransactMode(mode: StoreTransactionMode) {
    this._storeTransactMode = mode
  }

  debug() {
    window.DEBUG = !window.DEBUG
    return window.DEBUG ? 'Debug ON' : 'Debug OFF'
  }

  private calculateEPS(game: Game) {
    if (window.DEBUG) console.group('Calculating EPS...')
    game.manualLabor = this._manualLaborMultipliers.calculate(game, game.producers, 1).total
    game.producers.recalculate(game)
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
      console.group(
        `Game update frame after %c${time}ms`,
        Console.TIME
      )
      console.log(...this.outputClickEvents(lastFrame))
    }
    this.unlocks.process(this, this.producers, this.upgrades, this.balances)
    if (window.DEBUG) console.groupEnd()
  }

  private processUpgrades(game: Game, producers: Producers, purchases: Purchases) {
    const purchasedIds = purchases.ids()

    if (window.DEBUG) console.group(`Processing ${game.upgrades.length} upgrades...`)
    game.upgrades.forEach((upgrade) => {
      if (purchasedIds.includes(upgrade.id)) {
        if (window.DEBUG) console.log(`Installing upgrade %c${upgrade.id}`, Console.ID)
        upgrade.install(game, producers)
        upgrade.available = false
      }
    })
    if (window.DEBUG) console.groupEnd()
  }

  private outputClickEvents(count: number): string[] {
    const messages: string[] = []

    if (count > 0) {
      messages.push(
        `%c${count}%c click events`,
        Console.EVENT,
        Console.CLEAR
      )
    } else {
      messages.push('0 click events')
    }

    return messages
  }
}