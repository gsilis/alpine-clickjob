import { SafeValue } from "./safe-value"

export class Balance {
  private _balance = new SafeValue('game.balance', 0, parseFloat)
  private _maxBalance = new SafeValue('game.maxBalance', 0, parseFloat)

  earn(amount: number) {
    if (amount <= 0) return
    this.balance += amount
    this.maxBalance += amount
  }

  spend(amount: number) {
    if (amount <= 0 || this.balance < amount) return
    this.balance -= amount
  }

  get displayBalance() {
    return this.balance.toFixed(1)
  }

  get balance() {
    return this._balance.value
  }

  set balance(val: number) {
    this._balance.value = val
  }

  get displayMaxBalance(): string {
    return this.maxBalance.toFixed(1)
  }

  get maxBalance() {
    return this._maxBalance.value
  }

  set maxBalance(val: number) {
    this._maxBalance.value = val
  }
}