import type { Balance } from "./balance";
import type { Game } from "./game";
import type { Producers } from "./producers";
import type { UnlockGameStateProcessor, UnlockInstaller } from "./unlocks";

export class UnlockStateFactory {
  createMaxScoreWatcher(name: string, minScore: number): UnlockGameStateProcessor {
    return (_game: Game, _producers: Producers, balance: Balance) => {
      const score = balance.maxBalance

      return score >= minScore ? 1 : 0
    }
  }

  createProductCountWatcher(productId: string, quantity: number): UnlockGameStateProcessor {
    return (_game: Game, producers: Producers, _balance: Balance) => {
      const product = producers.find(productId)
      let state = 0
      if (product && product.quantity >= quantity) state = 1
      return state
    }
  }

  createRevealer(productId: string): UnlockInstaller {
    return (_game: Game, producers: Producers, _balance: Balance) => {
      if (window.DEBUG) {
        console.log(`%cINSTALL%c %creveal%c %c${productId}`, 'background-color: darkgreen; color: white;', 'background-color: none; color: auto', 'color: white; background-color: #666666; padding: 1px 2px;', 'color: auto; background-color: none;', 'color: white; background-color: #0057ad; padding: 1px 2px;')
      }

      const product = producers.find(productId)
      if (!product) return
      product.revealed = true
    }
  }

  createAvailabler(productId: string): UnlockInstaller {
    return (_game: Game, producers: Producers, _balance: Balance) => {
      if (window.DEBUG) {
        console.log(`%cINSTALL%c %cavailable%c %c${productId}`, 'background-color: darkgreen; color: white;', 'background-color: none; color: auto', 'color: black; background-color: #94fff6; padding: 1px 2px;', 'color: auto; background-color: none;', 'color: white; background-color: #0057ad; padding: 1px 2px;')
      }

      const product = producers.find(productId)
      if (!product) return
      product.available = true
    }
  }

  DEBUGLOGGER(value: any): UnlockInstaller {
    return () => {
      console.log(`%cINSTALL%c %cDEBUG`, 'background-color: darkgreen; color: white;', 'background-color: none; color: auto', 'background-color: red; color: white; padding: 1px 2px', JSON.stringify(value))
    }
  }
}