import { SafeValueManager } from "./safe-value-manager"

export class SafeValue<T> {
  private _name: string
  private _default: T
  private _conversion: (raw: any) => T
  private _cached: T

  constructor(name: string, defaultValue: T, convertFromStored: (raw: any) => T) {
    this._name = name
    this._default = defaultValue
    this._conversion = convertFromStored
    SafeValueManager.register(name)
    this._cached = this.retrieve()
  }

  get value(): T {
    return this._cached
  }

  set value(val: T) {
    this._cached = val
    localStorage.setItem(this._name, JSON.stringify(val))
  }

  private retrieve(): T {
    let val: T

    try {
      let raw = localStorage.getItem(this._name)
      if (raw === null) {
        val = this._default
      } else {
        raw = JSON.parse(raw)
        val = this._conversion(raw)
      }
    } catch (err) {
      val = this._default
    }

    return val
  }
}