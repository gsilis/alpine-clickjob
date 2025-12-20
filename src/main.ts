import { Game, type Product, type Upgrade } from './game'
import { Progression } from './progression'
import './style.css'
import Alpine from 'alpinejs'
import { UnlockFactory } from './unlock-factory'
import { UnlockStateFactory } from './unlock-state-factory'
import type { Unlock } from './unlocks'

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
    const unlockProgression = new Progression(10, 1.8)
    const priceProgression = new Progression(10, 1.5)
    const levels: {
      id: string,
      title: string,
      boost: number,
      description: string,
    }[] = [
      { id: 'paper', title: 'Paper', boost: 2, description: 'Paper mache {P} are faster!' },
      { id: 'plastic', title: 'Plastic', boost: 2, description: 'New and improved waterproof† {P} made out of plastic. †Not guaranteed to be waterproof.' },
      { id: 'steel', title: 'Steel', boost: 2, description: 'Cold hard steel {P}. They yield to nobody.' },
      { id: 'copper', title: 'Copper', boost: 2, description: 'Good enough for plumbing, good enough for {P}.' },
      { id: 'bronze', title: 'Bronze', boost: 2, description: 'A new age for {P}! They also look very substantial.' },
      { id: 'silver', title: 'Silver', boost: 2.5, description: 'Make nice and shiny {P}.' },
      { id: 'gold', title: 'Gold', boost: 2.5, description: 'We can now make our {P} even heavier! Other than that, this serves no other real purpose.' },
      { id: 'platinum', title: 'Platinum', boost: 3, description: `To the untrained eye, this looks just like silver. But if you have to explain it to everyone anyways, what does it matter if the {P} are made out of platinum?` },
      { id: 'palladium', title: 'Palladium', boost: 3, description: `We're not saying that these {P} are made out of stolen catalytic converters, but where else are you going to find palladium?` },
      { id: 'iridium', title: 'Iridium', boost: 3, description: 'This metal makes it into a lot of games, right? Why should our {P} be any different?' },
      { id: 'beryllium', title: 'Beryllium', boost: 3, description: `I'll be honest, I've never even seen Beryllium. But it's on the periodic table, so in theory you can make {P} out of it.` },
      { id: 'rainbow', title: 'Rainbow', boost: 3.5, description: `You have to look at the {P} just after a rain storm, but if you catch the light just right, it's amazing.` },
      { id: 'quantum', title: 'Quantum', boost: 3.5, description: `You're only licensed to one Quantum {P} at any given time.` },
      { id: 'subspace', title: 'Subspace', boost: 3.5, description: 'Taken right out of the warp core, might want to let this {P} cool a bit before touching it.' },
      { id: 'godlike', title: 'Godlike', boost: 5, description: `Did you just hear the {P} say something? It can't talk, right?` }
    ]
    const levelsToUpgrades = levels.map<Upgrade>(({ id, title, boost, description }) => {
      return {
        id: `${id}-${product.id}`,
        productId: product.id,
        title: `${title} ${product.title}`,
        description: description.replace(/\{P\}/gi, product.title),
        effectDescription: `Increase the output of ${product.title} by ${boost * 100}%`,
        price: priceProgression.next(),
        unlockAt: unlockProgression.next()
      }
    })

    return [...acc, ...levelsToUpgrades]
  }, []))
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
    return [
      ...acc,
      unlockFactory.createAutomatic(
        `show-${upgrade.id}`,
        unlockStateFactory.createProductCountWatcher(upgrade.productId, upgrade.unlockAt),
        unlockStateFactory.DEBUGLOGGER(upgrade)
      )
    ]
  }, [])),
]

const game = new Game(PRODUCTS, UPGRADES, UNLOCKS)

window.DEBUG = true
window.Alpine = Alpine
window.game = game
Alpine.start()

Alpine.store('game', window.game)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main x-data="$store.game" x-init="setup($store.game)">
    <h1 x-text="balances.displayBalance"></h1>
    <p>All Time = <span x-text="balances.displayMaxBalance"></span></p>
    <p>EPS: <span x-text="producers.displayOverallProductivity"></span></p>
    <p>Manual EPC: <span x-text="displayManualLaborValue"></span></p>
    <button @click="work()">Work</button>
    <hr />
    <div class="flex flex-col">
      <h1>Producers</h1>
      <template x-for="producer in producers.producers">
        <section x-data="producer" x-show="producer.revealed">
          <p x-text="quantity"></p>
          <p>
            <span x-show="mysterious">????</span>
            <span x-show="available" x-text="title"></span>
          </p>
          <p x-text="displayPrice"></p>
          <button @click="buy($store.game, producer, 1)">Buy</button>
          <button @click="sell($store.game, producer, 1)">Sell</button>
        </section>
      </template>
      <h1>Upgrades</h1>
      <template x-for="upgrade in upgrades.producers">
        <section x-data="upgrade" x-show="upgrade.available">
          <p x-text="title"></p>
          <p>Price: <span x-text="displayPrice"></span></p>
          <button @click="buyUpgrade($store.game, upgrade)">Buy</button>
        </section>
      </template>
    </div>
  </main>
`