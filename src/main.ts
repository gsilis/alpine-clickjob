import { Game } from './game'
import './style.css'
import Alpine from 'alpinejs'

window.Alpine = Alpine
window.game = new Game()
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