import { Game, type Product, type Upgrade } from './game'
import { Progression } from './progression'
import './style.css'
import Alpine from 'alpinejs'
import { UnlockFactory } from './unlock-factory'
import { UnlockStateFactory } from './unlock-state-factory'
import type { Unlock, UnlockGameStateProcessor } from './unlocks'
import type { Producers } from './producers'

const PRODUCTS: Product[] = [
  {
    id: 'macro', title: 'Macros',
    basePrice: 15,
    baseProductivity: 0.1,
    description: `
      Run a macro to click the button for you.
    `,
   },
   {
    id: 'scroll-wheel', title: 'Scroll Wheels',
    basePrice: 100,
    baseProductivity: 1,
    description: `
      You've bound your mouse wheel rotations to a left click using a program you downloaded from Totally Legitemate Corp™.
    `
   },
   {
    id: 'extra-hand', title: 'Extra Hands',
    basePrice: 1000,
    baseProductivity: 3,
    description: `
      Click using both arms. Of course you need to invest in a new kind of mouse to do this, that's why it's so expensive.
    `
   },
   {
    id: 'ad-platform-server', title: 'Ad Platform Servers',
    basePrice: 5300,
    baseProductivity: 50,
    description: `
      Why click on the button yourself? You've created an ad platform that directs other peoples' clicks to your button.
    `
  },
  {
    id: 'foot-pedal', title: 'Foot Pedals',
    basePrice: 10000,
    baseProductivity: 125,
    description: `
      Don't let your other limbs go to waste, let them generate clicks too! Having learned your lessons from Ambidexterity, this is a set of two pedals, rather than just one.
    `
  },
  {
    id: 'metronome', title: 'Metronomes',
    basePrice: 20000,
    baseProductivity: 230,
    description: `
      Swings back and forth to click the button.
    `
  }
]

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
  }
]

const unlockProductProgression = new Progression(10, 4)
const availableProductProgression = new Progression(12, 4)
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
]

const game = new Game(PRODUCTS, UPGRADES, UNLOCKS)

window.DEBUG = false
window.Alpine = Alpine
window.game = game
Alpine.start()

Alpine.store('game', window.game)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main x-data="$store.game" x-init="setup($store.game)" class="grid grid-cols-[auto] grid-rows-[200px_auto_70px_150px] h-screen">
    <section class="flex-[0_100px] backgrounded px-3 py-8 row-1 balance-box blue-bottom">
      <h1 x-text="balances.displayBalance" class="font-mono text-2xl text-white text-center my-2"></h1>
      <p class="text-center text-white">
        <span x-text="producers.displayOverallProductivity"></span>
        <span class="text-[10px] align-top">EPS</span>
      </p>
    </section>
    <section class="manual-box reverse-backgrounded row-4 flex justify-center items-center">
      <button @click="work()" id="work"><span>🙂</span></button>
    </section>
    <section class="flex flex-row reverse-backgrounded row-3 col-1 store-modes">
      <button class="flex-1 text-sky-400 cursor-pointer" :class="{'active': storeMode === 'purchases'}" @click="storeMode = 'purchases'">Producers</button>
      <button class="flex-1 text-sky-400 cursor-pointer" :class="{'active': storeMode === 'upgrades'}" @click="storeMode = 'upgrades'">
        Upgrades
        <span x-text="availableUpgrades" x-show="availableUpgrades > 0" class="ml-2 text-white bg-red-500 px-2 py-1 rounded-xl font-bold"></span>
      </button>
    </section>
    <div class="flex flex-col backgrounded grid-row-2 store-box overflow-scroll text-white row-2">
      <div class="flex flex-col" x-show="storeMode === 'purchases'">
        <template x-for="producer in producers.producers">
          <section x-data="producer" x-show="producer.revealed" class="grid grid-rows-3 grid-cols-[50px_1fr_50px_50px] my-2 px-3 gap-x-4 gap-y-0" :class="{ 'unavailable-item' : price > balance }">
            <div class="w-[50px] h-[50px] row-1 col-1 row-span-4 border-3 rounded-xl border-amber-500"></div>
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
            <button @click="buy($store.game, producer, 1)" class="col-3 row-1 row-span-3 w-[50px] h-[50px] rounded-[10em] buy-button text-2xl cursor-pointer">🛒</button>
            <button @click="sell($store.game, producer, 1)" class="col-4 row-1 row-span-3 w-[50px] h-[50px] rounded-[10em] sell-button text-2xl cursor-pointer">💰</button>
          </section>
        </template>
      </div>
      <div class="flex flex-col backgrounded grid-row-2 store-box overflow-scroll text-white row-2" x-show="storeMode === 'upgrades'">
        <template x-for="upgrade in upgrades">
          <section x-data="upgrade" x-show="upgrade.available" class="grid grid-rows-3 grid-cols-[50px_1fr_50px] my-2 px-3 gap-x-4 gap-y-0">
            <div class="w-[50px] h-[50px] row-1 col-1 row-span-4 border-3 rounded-xl border-amber-500"></div>
            <p x-text="title" x-bind:title="description" class="row-1 col-2"></p>
            <p class="row-2 col-2 text-xl" :class="{ 'available': price <= balance, 'unavailable': price > balance }"><span x-text="displayPrice"></span></p>
            <p class="row-3 col-2" x-text="effectDescription"></p>
            <button @click="buyUpgrade($store.game, upgrade)" class="col-3 row-1 row-span-3 w-[50px] h-[50px] rounded-[10em] buy-button text-2xl cursor-pointer">🛒</button>
          </section>
        </template>
      </div>
    </div>
  </main>
`