export class IdUtility {
  private _prefix: string
  private _suffix: string
  private _separator: string

  constructor(prefix: string = '', separator: string = '', suffix: string = '') {
    this._prefix = prefix
    this._suffix = suffix
    this._separator = separator
  }

  out(part: string): string {
    return [
      this._prefix,
      this._prefix && this._separator,
      part,
      this._suffix && this._separator,
      this._suffix
    ].filter((value) => !['', undefined].includes(value)).join('')
  }
}