import type { Balance } from "./balance";
import type { Game } from "./game";
import type { Producers } from "./producers";
import type { SafeValue } from "./safe-value";

export type UnlockGameStateProcessor = (game: Game, producers: Producers, balance: Balance) => number
export type UnlockInstaller = (game: Game, producers: Producers, balance: Balance) => void

export interface Unlock {
  id: string,
  title: string,
  description: string,
  effectDescription: string,
  price: number,
  // 0 = hidden, 1 = available, 2 = applied
  state: number,
  getStateFrom(game: Game, producers: Producers, balance: Balance): number,
  install(game: Game, producers: Producers, balance: Balance): void,
  get available(): boolean,
  get installed(): boolean,
}

export class Unlocks {
  /**
   * The whole list of all registered unlocks. Regardless of availability or purchase
   */
  private _unlocks: Unlock[] = []
  /**
   * List of IDs that have already been purchased and applied
   */
  private _unlocked: SafeValue<string[]>
  /**
   * Unlocks that still need to be unlocked, these are the ones calculated in the loop
   */
  private _pending: Unlock[] = []

  constructor(storage: SafeValue<string[]>) {
    this._unlocked = storage
  }

  register(unlock: Unlock) {
    const missing = this._unlocks.find(u => u.id === unlock.id) === undefined
    const pending = !this._unlocked.value.includes(unlock.id)
    unlock.state = 0

    if (!missing) {
      unlock.state = 2
      return
    }

    // The unlock is not registered yet
    if (pending) this._pending.push(unlock)
    this._unlocks.push(unlock)
  }

  findById(id: string): Unlock | undefined {
    return this._unlocks.find(u => u.id === id)
  }

  process(game: Game, producers: Producers, balance: Balance) {
    if (window.DEBUG) console.group(`Unlock Processing at balance = ${balance.balance}, maxBalance = ${balance.maxBalance}`)
    const removals: Unlock[] = []

    this._pending.forEach(unlock => {
      unlock.state = unlock.getStateFrom(game, producers, balance)
      if (unlock.available) {
        unlock.install(game, producers, balance)
        removals.push(unlock)
      }
    })

    this._pending = this._pending.filter(u => !removals.includes(u))

    if (window.DEBUG) {
      console.log(`Unlock processing yielded ${removals.length} hits: ${JSON.stringify(removals.map(r => r.id))}; ${this._pending.length} unlocks remaining.`)
      console.groupEnd()
    }
  }

  purchase(id: string) {
    const unlock = this.findById(id)

    if (!unlock) return
    const pendingIndex = unlock && this._pending.indexOf(unlock) || -1

    if (pendingIndex > -1) {
      this._pending.splice(pendingIndex, 1)
    }

    if (!this._unlocked.value.includes(id)) {
      this._unlocked.value = [...this._unlocked.value, id]
    }
  }
}