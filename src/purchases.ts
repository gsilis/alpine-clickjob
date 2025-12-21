import type { SafeValue } from "./safe-value";

export class Purchases {
  private ids: SafeValue<string[]>

  constructor(safeValue: SafeValue<string[]>) {
    this.ids = safeValue
  }

  add(id: string) {
    const existingIds = this.ids.value
    if (!existingIds.includes(id)) this.ids.value = [...existingIds, id]
  }
}