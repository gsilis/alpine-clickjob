import type { Game } from "./game";
import { SafeValue } from "./safe-value";

type Callback = (game: Game) => void
type RegistrationCondition = (game: Game) => boolean
type Registration = {
  id: string,
  condition: RegistrationCondition,
  callback: Callback,
  skipCallback: boolean
}

export class Revealable {
  private _revealedIds = new SafeValue<string[]>('game.reveals', [], (raw) => {
    return raw as string[]
  })
  private _watched: Registration[] = []
  private _applications: Record<string, Callback> = {}

  add(id: string, condition: RegistrationCondition, callback: Callback, application: Callback, skipCallback: boolean = false) {
    this._watched.push({ id, condition, callback, skipCallback })
    this._applications[id] = application
  }

  findApplicationFor(id: string): Callback | void {
    return this._applications[id]
  }

  process(game: Game, skipAvailable: boolean = false) {
    this._watched = this._watched.filter(({ id, condition, callback, skipCallback }) => {
      let keep = true
      try {
        const isSatisfied = condition.call(game, game)
        if (isSatisfied === true) this.saveId(id)
        keep = !isSatisfied
      } catch (err) {
        keep = true
      }

      const doCallback = !(skipAvailable && skipCallback) || !skipAvailable
      if (!keep && doCallback) {
        try {
          callback.call(undefined, game)
        } catch (err) {}
      }

      return keep
    })
  }

  private saveId(id: string) {
    if (this._revealedIds.value.includes(id)) return
    this._revealedIds.value = [...this._revealedIds.value, id]
  }
}