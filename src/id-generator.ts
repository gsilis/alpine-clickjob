export class IdGenerator {
  private _prefix?: string
  private _current = 0
  
  constructor(prefix?: string) {
    this._prefix = prefix
  }

  next(): string {
    this._current += 1
    const prefix = this._prefix !== undefined ? this._prefix : ''
    return `${prefix}${prefix && '-'}${this._current}`
  }
}