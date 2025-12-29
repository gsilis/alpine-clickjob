import type { Balance } from "./balance";
import { Console } from "./console";
import type { Game, StoredUpgrade } from "./game";
import type { Producers } from "./producers";
import type { UnlockGameStateProcessor, UnlockInstaller } from "./unlocks";

export class UnlockStateFactory {
  createMaxScoreWatcher(_name: string, minScore: number): UnlockGameStateProcessor {
    return (_game: Game, _producers: Producers, _upgrades: StoredUpgrade[], balance: Balance) => {
      const score = balance.maxBalance

      return score >= minScore ? 1 : 0
    }
  }

  createProductCountWatcher(productId: string, quantity: number): UnlockGameStateProcessor {
    return (_game: Game, producers: Producers, _upgrades: StoredUpgrade[], _balance: Balance) => {
      const product = producers.find(productId)
      let state = 0
      if (product && product.quantity >= quantity) state = 1
      return state
    }
  }

  createRevealer(productId: string): UnlockInstaller {
    return (_game: Game, producers: Producers, _upgrades: StoredUpgrade[], _balance: Balance) => {
      if (window.DEBUG) {
        console.log(
          `%cUNLOCK%c %creveal%c %c${productId}`,
          Console.EVENT,
          Console.CLEAR,
          Console.ACTION,
          Console.CLEAR,
          Console.ID
        )
      }

      const product = producers.find(productId)
      if (!product) return
      product.revealed = true
    }
  }

  createAvailabler(productId: string): UnlockInstaller {
    return (_game: Game, producers: Producers, _upgrades: StoredUpgrade[], _balance: Balance) => {
      if (window.DEBUG) {
        console.log(
          `%cUNLOCK%c %cavailable product%c %c${productId}`,
          Console.EVENT,
          Console.CLEAR,
          Console.ACTION,
          Console.CLEAR,
          Console.ID
        )
      }

      const product = producers.find(productId)
      if (!product) return
      product.available = true
    }
  }

  createUpgradeAvailabler(upgradeId: string): UnlockInstaller {
    return (_game: Game, _producers: Producers, upgrades: StoredUpgrade[], _balance: Balance) => {
      if (window.DEBUG) {
        console.log(
          `%cUNLOCK%c %cavailable upgrade%c %c${upgradeId}`,
          Console.EVENT,
          Console.CLEAR,
          Console.ACTION,
          Console.CLEAR,
          Console.ID
        )
      }

      const upgrade = upgrades.find(u => u.id === upgradeId)
      if (!upgrade) return
      upgrade.available = true
    }
  }

  DEBUGLOGGER(value: any): UnlockInstaller {
    return () => {
      console.log(
        `%cUNLOCK%c %cDEBUG`,
        Console.EVENT,
        Console.CLEAR,
        Console.WARN,
        JSON.stringify(value)
      )
    }
  }
}