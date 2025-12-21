import type { SafeValue } from "./safe-value";

export class Purchases {
  private _ids: SafeValue<string[]>

  constructor(safeValue: SafeValue<string[]>) {
    this._ids = safeValue
  }

  add(id: string) {
    const existingIds = this._ids.value
    if (!existingIds.includes(id)) this._ids.value = [...existingIds, id]
  }

  ids(): string[] {
    return [...this._ids.value]
  }
}