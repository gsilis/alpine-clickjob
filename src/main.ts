import { Game, type Product, type Upgrade } from './game'
import { Progression } from './progression'
import './style.css'
import Alpine from 'alpinejs'
import { UnlockFactory } from './unlock-factory'
import { UnlockStateFactory } from './unlock-state-factory'
import type { Unlock, UnlockGameStateProcessor } from './unlocks'
import type { Producers } from './producers'
import { SMILEYS } from './smileys'
import { CanvasScaler } from './canvas-scaler'
import { Renderer } from './renderer'
import { Rectangle } from './rectangle'
import { FriendlyResizeObserver } from './friendly-resize-observer'
import { Coordinate } from './coordinate'
import ManualClickIcon from './images/manual-clicks.svg'
import { PRODUCTS } from './config/products'

const Icons = {
  manualClicks: ManualClickIcon
}

const smileyPriceProgression = new Progression(1000000, 2)
const UPGRADES: Upgrade[] = [
  // These are based on quantity of each product
  ...(PRODUCTS.reduce<Upgrade[]>((acc: Upgrade[], product: Product) => {
    const unlockProgression = new Progression(15, 1.9)
    const priceProgression = new Progression(100, 2)
    const levels: {
      id: string,
      title: string,
      boost: number,
      description: string,
    }[] = [
      { id: 'paper', title: 'Paper', boost: 1, description: 'Paper mache {P} are faster!' },
      { id: 'plastic', title: 'Plastic', boost: 1, description: 'New and improved waterproof† {P} made out of plastic. †Not guaranteed to be waterproof.' },
      { id: 'steel', title: 'Steel', boost: 1, description: 'Cold hard steel {P}. They yield to nobody.' },
      { id: 'copper', title: 'Copper', boost: 1, description: 'Good enough for plumbing, good enough for {P}.' },
      { id: 'bronze', title: 'Bronze', boost: 1, description: 'A new age for {P}! They also look very substantial.' },
      { id: 'silver', title: 'Silver', boost: 1.5, description: 'Make nice and shiny {P}.' },
      { id: 'gold', title: 'Gold', boost: 1.5, description: 'We can now make our {P} even heavier! Other than that, this serves no other real purpose.' },
      { id: 'platinum', title: 'Platinum', boost: 1.75, description: `To the untrained eye, this looks just like silver. But if you have to explain it to everyone anyways, what does it matter if the {P} are made out of platinum?` },
      { id: 'palladium', title: 'Palladium', boost: 1.75, description: `We're not saying that these {P} are made out of stolen catalytic converters, but where else are you going to find palladium?` },
      { id: 'iridium', title: 'Iridium', boost: 1.75, description: 'This metal makes it into a lot of games, right? Why should our {P} be any different?' },
      { id: 'beryllium', title: 'Beryllium', boost: 1.75, description: `I'll be honest, I've never even seen Beryllium. But it's on the periodic table, so in theory you can make {P} out of it.` },
      { id: 'rainbow', title: 'Rainbow', boost: 2, description: `You have to look at the {P} just after a rain storm, but if you catch the light just right, it's amazing.` },
      { id: 'quantum', title: 'Quantum', boost: 2, description: `You're only licensed to one Quantum {P} at any given time.` },
      { id: 'subspace', title: 'Subspace', boost: 2, description: 'Taken right out of the warp core, might want to let this {P} cool a bit before touching it.' },
      { id: 'godlike', title: 'Godlike', boost: 5, description: `Did you just hear the {P} say something? It can't talk, right?` }
    ]
    const levelsToUpgrades = levels.map<Upgrade>(({ id, title, boost, description }) => {
      const compId = `${id}-${product.id}`
      return {
        id: compId,
        productId: product.id,
        title: `${title} ${product.title}`,
        description: description.replace(/\{P\}/gi, product.title),
        effectDescription: `Increase the output of ${product.title} by ${boost * 100}%`,
        price: product.basePrice * priceProgression.next(),
        unlockAt: unlockProgression.next(),
        install: (_game: Game, producers: Producers) => {
          producers.find(product.id).boost(compId, boost)
        }
      }
    })

    return [...acc, ...levelsToUpgrades]
  }, [])),
  ...(SMILEYS.reduce<Upgrade[]>((acc, smiley) => {
    const price = smileyPriceProgression.next()

    return [
      ...acc,
      {
        id: smiley.id,
        title: smiley.title,
        description: `Produce ${smiley.title} emojis`,
        effectDescription: `Increase production by ${smiley.rate * 100}%`,
        price: price,
        unlockAt: price * 0.9,
        install: (game: Game, producers: Producers) => {
          game.smileys.unlock(smiley.id)
          producers.increase(smiley.id, smiley.rate)
        }
      }
    ]
  }, [])),
  {
    id: 'turbo-mouse', title: 'Turbo Mouse',
    description: `Install a sick turbo on your computer mouse.`,
    effectDescription: `Gain 1EPS for every 3 macros you own.`,
    price: 5000,
    unlockAt: 10000,
    install: (game: Game, _producers: Producers) => {
      game.addManualLaborMultiplier('turbo-mouse', (_game: Game, producers: Producers) => {
        const macros = Math.floor(producers.find('macro').quantity / 3)
        return macros
      })
    }
  },
  {
    id: 'super-turbo-mouse', title: 'Super Turbo Mouse',
    description: `Pump up the jam on the turbo mouse`,
    effectDescription: `Gain 3 EPS for every 6 macros you own.`,
    price: 10000,
    unlockAt: 9900,
    install: (game: Game, _producers: Producers) => {
      game.addManualLaborMultiplier('super-turbo-mouse', (_game: Game, producers: Producers) => {
        const macro = Math.floor(producers.find('macro').quantity / 6)
        return macro * 3
      })
    }
  }
]

const unlockProductProgression = new Progression(10, 4)
const availableProductProgression = new Progression(12, 4)
const smileyProgression = new Progression(100000, 2)
const unlockFactory = new UnlockFactory()
const unlockStateFactory = new UnlockStateFactory()
const UNLOCKS: Unlock[] = [
  ...(PRODUCTS.reduce<Unlock[]>((acc, product) => {
    return [
      ...acc,
      unlockFactory.createAutomatic(
        `reveal-${product.id}`,
        unlockStateFactory.createMaxScoreWatcher(`${product.id} reveal`, unlockProductProgression.next()),
        unlockStateFactory.createRevealer(product.id)
      ),
      unlockFactory.createAutomatic(
        `available-${product.id}`,
        unlockStateFactory.createMaxScoreWatcher(`${product.id} available`, availableProductProgression.next()),
        unlockStateFactory.createAvailabler(product.id)
      )
    ]
  }, [])),
  ...(UPGRADES.reduce<Unlock[]>((acc, upgrade) => {
    let processor: UnlockGameStateProcessor

    if (upgrade.productId) {
      processor = unlockStateFactory.createProductCountWatcher(upgrade.productId, upgrade.unlockAt)
    } else {
      processor = unlockStateFactory.createMaxScoreWatcher(upgrade.id, upgrade.unlockAt)
    }
    return [
      ...acc,
      unlockFactory.createAutomatic(
        `show-${upgrade.id}`,
        processor,
        unlockStateFactory.createUpgradeAvailabler(upgrade.id)
      )
    ]
  }, [])),
  ...(SMILEYS.reduce<Unlock[]>((acc, smiley) => {
    return [
      ...acc,
      unlockFactory.createAutomatic(
        `show-${smiley.id}`,
        unlockStateFactory.createMaxScoreWatcher(smiley.id, smileyProgression.next()),
        unlockStateFactory.createUpgradeAvailabler(smiley.id)
      )
    ]
  }, []))
]

const game = new Game(PRODUCTS, UPGRADES, UNLOCKS)

window.DEBUG = false
window.Alpine = Alpine
window.game = game
Alpine.start()

Alpine.store('game', window.game)
Alpine.store('icons', Icons)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main x-data="$store.game" x-init="setup($store.game)" class="grid grid-cols-[auto] grid-rows-[100px_auto_70px_150px] h-screen no-select md:grid-cols-[400px_1fr] md:grid-rows-[150px_50px_1fr_150px] relative overflow-hidden backgrounded">
    <canvas id="smiley-canvas" class="absolute w-full h-full z-10"></canvas>
    <section class="flex-[0_100px] px-3 py-4 md:py-8 row-1 balance-box blue-bottom md:col-span-2 md:row-1 relative z-20">
      <h1 x-text="display.humanNumber(balances.balance)" class="font-mono text-[30px] text-white text-center my-2 hidden md:block"></h1>
      <h1 x-text="balances.displayBalance" class="font-mono text-[16px] text-white text-right my-2 md:hidden"></h1>
      <p class="text-right md:text-center text-white text-[11px] md:text-[15px]">
        <span x-text="producers.displayOverallProductivity"></span>
        <span class="text-[0.9em] align-top">EPS</span>
      </p>
    </section>
    <section class="manual-box row-4 flex justify-center items-center md:row-4 md:col-span-2 md-blue-top relative z-80 no-touch">
      <button @click="work()" @mousedown="mousedown()" id="work"><span x-text="character"></span></button>
    </section>
    <section class="flex flex-row row-3 col-1 store-modes md:row-2 md:col-1 md:col-span-3 relative z-20">
      <div class="hidden md:flex md:flex-[0_400px] blue-bottom flex-row text-xs text-white flex-1 gap-2 items-center px-3">
        <p class="flex-[0_25px]"></p>
        <p class="flex-1 text-right">Total</p>
        <p class="flex-1 text-right">EPS</p>
      </div>
      <button class="flex-1 md:flex-0 md:px-6 text-sky-400 cursor-pointer no-touch" :class="{'active': storeMode === 'purchases'}" @click="storeMode = 'purchases'">
        Producers
      </button>
      <button class="flex-1 md:flex-0 md:px-6 text-sky-400 cursor-pointer no-touch text-nowrap" :class="{'active': storeMode === 'upgrades'}" @click="storeMode = 'upgrades'">
        Upgrades
        <span x-text="availableUpgrades" x-show="availableUpgrades > 0" class="ml-2 text-white bg-red-500 px-2 py-1 rounded-xl font-bold"></span>
      </button>
      <button class="flex-1 text-sky-400 cursot-pointer no-touch md:hidden" :class="{'active': storeMode === 'history'}" @click="storeMode = 'history'">
        Stats
      </button>
      <div x-show="storeMode === 'purchases'" class="flex-1 justify-end items-center flex gap-3 px-3 hidden md:flex">
        <button class="uppercase flex-[0_50px] cursor-pointer store-mode px-2 py-1 rounded-xl" x-bind:disabled="storeTransactMode === 'store-buy'" @click="storeTransactMode = 'store-buy'" x-show="producers.hasAvailableProducers">Buy</button>
        <button class="uppercase flex-[0_50px] cursor-pointer store-mode px-2 py-1 rounded-xl" x-bind:disabled="storeTransactMode === 'store-sell'" @click="storeTransactMode = 'store-sell'" x-show="producers.hasAvailableProducers">Sell</button>
      </div>
    </section>
    <div class="flex flex-col grid-row-2 store-box text-white row-2 md:row-3 md:col-1 md:col-span-3 md:grid md:grid-rows-[80px_1fr] md:grid-cols-[400px_1fr] relative z-20 overflow-hidden">
      <div class="flex gap-2 flex-col grid-row-2 store-box text-white row-2 md:row-2 md:col-1 md:flex-[400px_0] show-mobile md:row-span-2 md:col-1 border-r-1 border-sky-950 overflow-scroll no-scrollbars" :class="{'active':storeMode === 'history'}">
        <template x-for="producer in producers.availableProducers">
          <div class="flex flex-row gap-2 w-full px-3 py-2 border-b-1 border-sky-950 text-sm">
            <p class="flex-[0_25px] h-[25px] border-1 rounded-sm border-amber-500 overflow-hidden">
              <img x-bind:src="producer.iconSrc" x-show="producer.iconSrc" class="w-full h-full" />
            </p>
            <p class="flex-1 text-right font-mono" x-text="display.humanShortAbbreviatedNumber(score.scoreFor(producer.name))"></p>
            <p class="flex-1 text-right" x-text="display.humanAbbreviatedNumber(producers.epsFor(producer.name))"></p>
          </div>
        </template>
        <div class="flex flex-row gap-2 w-full px-3 py-2 text-sm border-sky-950 border-b-1 py-3" x-show="!producers.availableProducers.length">
          No producers yet
        </div>
        <div class="hidden md:flex md:flex-0 blue-bottom flex-row text-xs text-white flex-1 gap-2 items-center px-3 py-3 mt-5">
          <p class="flex-[0_25px]"></p>
          <p class="flex-1 text-right">Manually Created</p>
          <p class="flex-1 text-right">Clicks</p>
        </div>
        <div class="flex flex-row gap-2 w-full px-3 py-2 border-b-1 border-sky-950 text-sm">
          <p class="flex-[0_25px] h-[25px] border-3 rounded-sm border-amber-500">
            <img x-bind:src="$store.icons.manualClicks" class="w-full h-full" />
          </p>
          <p class="flex-1 text-right font-mono" x-text="display.humanAbbreviatedNumber(score.scoreFor('manual'))"></p>
          <p class="flex-1 text-right font-mono" x-text="display.humanAbbreviatedNumber(score.scoreFor('clicks'))"></p>
        </div>
        <div class="flex flex-row gap-2 w-full px-3 py-3 mt-6 blue-bottom text-xs">
          <p class="flex-1 text-left">Stats</p>
        </div>
        <div class="flex flex-row gap-2 w-full px-3 py-3 border-b-1 border-sky-950 text-xs">
          <p class="flex-1 text-left">All Time</p>
          <p class="flex-3 text-right" x-text="display.humanShortAbbreviatedNumber(balances.maxBalance)"></p>
        </div>
        <div class="flex flex-row gap-2 w-full px-3 py-3 text-xs">
          <p class="flex-1 text-left">Per Click</p>
          <p class="flex-3 text-right" x-text="manualLabor"></p>
        </div>
      </div>
      <div class="flex flex-row p-3 gap-4 md:row-1 md:col-2" x-show="storeMode === 'purchases' && !producers.hasAvailableProducers">
        <p class="flex-1">No available producers yet</p>
      </div>
      <div class="flex flex-col md:row-1 md:row-span-3 md:col-2 overflow-scroll no-scrollbars" x-show="storeMode === 'purchases'">
        <template x-for="producer in producers.producers">
          <section x-data="producer" x-show="producer.revealed" class="grid grid-rows-[auto] grid-cols-[75px_1fr_50px_50px] my-2 px-3 gap-x-4 gap-y-0" :class="{ 'unavailable-item' : price > balance }">
            <div class="w-[75px] h-[75px] row-1 col-1 row-span-4 border-3 rounded-xl border-amber-500 overflow-hidden">
              <img x-bind:src="iconSrc" x-show="iconSrc" class="w-full h-full" />
            </div>
            <p class="row-1 col-2 text-white">
              <span x-show="mysterious">????</span>
              <span x-show="available" x-text="title" class="text-nowrap text-ellipsis"></span>
            </p>
            <p class="row-2 col-2 quantity">
              <span x-text="quantity"></span>
              <span>Owned</span>
            </p>
            <p class="row-3 col-2 price text-xl" :class="{ 'available': price <= balance, 'unavailable': price > balance }">
              <span x-text="displayPrice"></span>
            </p>
            <button @click="buy($store.game, producer, 1)" class="col-4 row-1 row-span-4 w-[50px] h-[50px] rounded-[10em] buy-button text-2xl cursor-pointer no-touch" x-show="storeTransactMode === 'store-buy'">🛒</button>
            <button @click="sell($store.game, producer, 1)" class="col-4 row-1 row-span-4 h-[50px] rounded-[10em] sell-button text-xs cursor-pointer no-touch" x-show="storeTransactMode === 'store-sell'">SELL</button>
            <p x-text="description" class="row-4 col-2 text-sky-600"></p>
          </section>
        </template>
      </div>
      <div class="flex flex-col store-box overflow-scroll no-scrollbars text-white row-2 md:row-1 md:row-span-2 md:col-2" x-show="storeMode === 'upgrades'">
        <p x-show="availableUpgrades <= 0" class="p-3">
          No upgrades available yet.
        </p>
        <template x-for="upgrade in upgrades">
          <section x-data="upgrade" x-show="upgrade.available" class="grid grid-rows-3 grid-cols-[50px_1fr_50px] my-2 px-3 gap-x-4 gap-y-0">
            <div class="w-[50px] h-[50px] row-1 col-1 row-span-4 border-3 rounded-xl border-amber-500"></div>
            <p x-text="title" x-bind:title="description" class="row-1 col-2"></p>
            <p class="row-2 col-2 text-xl" :class="{ 'available': price <= balance, 'unavailable': price > balance }"><span x-text="displayPrice"></span></p>
            <p class="row-3 col-2" x-text="effectDescription"></p>
            <button @click="buyUpgrade($store.game, upgrade)" class="col-3 row-1 row-span-4 align-center w-[50px] h-[50px] rounded-[10em] buy-button text-2xl cursor-pointer no-touch">🛒</button>
          </section>
        </template>
      </div>
    </div>
  </main>
`

const smileyCanvas = document.getElementById('smiley-canvas') as HTMLCanvasElement
if (!smileyCanvas) throw new Error('Could not find canvas')
CanvasScaler.fromCanvas(smileyCanvas)
const renderer = new Renderer(smileyCanvas)
const canvasEmitterWatcher = new FriendlyResizeObserver(smileyCanvas)
const emitterRectangle = Rectangle.fromDimensions(0, 0, 100, 100)
game.setRenderer(renderer, emitterRectangle)
canvasEmitterWatcher.listen((dim) => {
  const width = (dim.width / 2) - (emitterRectangle.width / 2) - 25
  const height = dim.height - emitterRectangle.height

  emitterRectangle.moveTo(Coordinate.from(width, height))
})
