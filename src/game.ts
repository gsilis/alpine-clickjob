import { Balance } from "./balance";
import { Config } from "./config";
import { Loop } from "./loop";
import type { Producer } from "./producer";
import { ProducerFactory } from "./producer-factory";
import { Producers } from "./producers";
import { Progression } from "./progression";
import { Revealable } from "./revealables";
import { SafeValue } from "./safe-value";
import { SafeValueManager } from "./safe-value-manager";
import { Score } from "./score";
import { ThrottledLoop } from "./throttled-loop";

export class Game {
  private __proxy?: Game;
  private loop = new ThrottledLoop(new Loop(), 36)
  private updateLoop = new ThrottledLoop(new Loop(), 3000)
  private config = new Config()
  private score = new Score()
  private producerFactory = new ProducerFactory(this.config.priceMultiplier)
  private producers = new Producers(this.producerFactory.create('null', 'Null', 0, 0))
  private upgrades = new Producers(this.producerFactory.create('null', 'Null', 0, 0))
  private manualLabor: SafeValue<number> = new SafeValue('game.manual-labor', 1, parseFloat)
  private balances = new Balance()
  private revealables = new Revealable()

  /**
   * This accepts the proxied game object from Alpine, otherwise any updates we do to the data objects won't get picked up by the UI
   */
  setup(game: Game) {
    this.__proxy = game

    const producerUpgrades: {
      name: string,
      title: string,
      basePriceMultiplier: number,
      productivity: number,
      minQuantity: number
    }[] = [
      { name: 'bronze', title: 'Bronze ', basePriceMultiplier: 100, productivity: 2, minQuantity: 25 },
      { name: 'silver', title: 'Silver ', basePriceMultiplier: 1000, productivity: 2, minQuantity: 50 },
      { name: 'gold', title: 'Gold ', basePriceMultiplier: 20000, productivity: 2, minQuantity: 100 },
      { name: 'iridium', title: 'Iridium ', basePriceMultiplier: 31000, productivity: 5, minQuantity: 250 },
      { name: 'beryllium', title: 'Beryllium ', basePriceMultiplier: 500000, productivity: 10, minQuantity: 500 },
    ]
    const producerConfig: {
      name: string,
      title: string,
      basePrice: number,
      baseProductivity: number
    }[] = [
      { name: 'macro', title: 'Macro', basePrice: 20, baseProductivity: 0.1 },
      { name: 'ad-platform', title: 'Ad Platforms', basePrice: 200, baseProductivity: 1 },
      { name: 'irresistable-button', title: 'Irresistable Button', basePrice: 1200, baseProductivity: 5 },
      { name: 'scroll-wheel', title: 'Scroll Wheel', basePrice: 15000, baseProductivity: 8 }
    ]

    producerConfig.forEach(({ name, title, basePrice, baseProductivity }) => {
      const producer = game.producerFactory.create(name, title, basePrice, baseProductivity)
      game.producers.add(producer)
      /**
       * Even though we have a handle for 'producer' in the loop, it is not the proxied version
       */
      game.revealables.add(
        `${name}-reveal`,
        (game) => game.balances.maxBalance >= producer.revealAt,
        (game) => {
          game.producers.find(producer.name).revealed = true
        },
        (game) => {},
      )
      game.revealables.add(
        `${name}-available`,
        (game) => game.balances.maxBalance >= producer.availableAt,
        (game) => {
          game.producers.find(producer.name).available = true
        },
        (game) => {},
      )

      producerUpgrades.forEach((config) => {
        const price = basePrice * config.basePriceMultiplier
        const upgradeName = `${name}-${config.name}`
        const upgrade = game.producerFactory.create(
          upgradeName,
          `${config.title}${title}`,
          price,
          config.productivity
        )
        game.upgrades.add(upgrade)
        game.revealables.add(
          upgradeName,
          (_) => {
            return producer.quantity >= config.minQuantity
          },
          (game) => {
            const u = game.upgrades.find(upgrade.name)
            u.revealed = u.available = true
          },
          (game) => {
            const u = game.upgrades.find(upgrade.name)
            producer.productivity *= upgrade.productivity
          },
          true
        )
      })
    })

    const manualPrices = new Progression(50000, 1.15)
    const manualMins = new Progression(5000, 1.25)
    const manualClicks: { name: string, title: string, baseProductivity: number }[] = [
      { name: 'coffee', title: 'Drink Coffee', baseProductivity: 1.01 },
      { name: 'broken-mouse', title: 'Broken Mouse', baseProductivity: 1.01 },
      { name: 'espresso', title: 'Espresso', baseProductivity: 1.02 },
      { name: 'double-espresso', title: 'Double Espresso', baseProductivity: 1.02 },
      { name: 'click-collider', title: 'Large Click Collider', baseProductivity: 1.02 },
      { name: 'rtfm', title: 'Read the Manual', baseProductivity: 1.02 },
      { name: 'gpus', title: 'GPU Rendering', baseProductivity: 1.03 }
    ]
    manualClicks.forEach(({ name, title, baseProductivity }) => {
      const upgrade = game.producerFactory.create(name, title, manualPrices.next(), baseProductivity)
      const minClicks = manualMins.next()

      game.upgrades.add(upgrade)
      game.revealables.add(name,
        (game) => {
          return game.balances.maxBalance >= minClicks
        },
        (game) => {
          const u = game.upgrades.find(upgrade.name)
          u.revealed = u.available = true
        },
        (game) => {
          const u = game.upgrades.find(upgrade.name)
          u.available = false
          console.log(`APPLYING UPGRADE ${u.name} -> +${u.productivity}`)
          game.manualLabor.value *= u.productivity
        },
        true
      )
    })

    game.loop.add(game.onLoop.bind(game))
    game.loop.start()

    this.revealables.process(game, true)
    this.calculateEPS(game)
    game.updateLoop.add(this.onUpdate.bind(game))
    game.updateLoop.start()
  }

  work() {
    const amount = this.manualLabor.value

    this.score.record('manual', amount)
    this.balances.earn(amount)
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
    const application = game.revealables.findApplicationFor(upgrade.name)
    if (price > game.balances.balance) return
    game.balances.spend(price)
    upgrade.available = false

    if (application) application.call(undefined, game)

    this.calculateEPS(game)
  }

  erase() {
    SafeValueManager.erase()
    window.location.reload()
  }

  pause() {
    this.loop.stop()
    this.updateLoop.stop()
  }

  resume() {
    this.loop.start()
    this.updateLoop.start()
  }

  get displayManualLaborValue() {
    return this.manualLabor.value.toFixed(2)
  }

  get proxy() {
    return this.__proxy
  }

  private calculateEPS(game: Game) {
    game.producers.recalculate()
  }

  private onLoop(time: number) {
    const amount = this.producers.overallProductivityMS * time

    this.producers.advance(time)
    this.balances.earn(amount)
  }

  private onUpdate(_time: number) {
    this.revealables.process(this)
  }
}