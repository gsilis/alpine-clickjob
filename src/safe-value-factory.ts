import { SafeValue } from "./safe-value"

export class SafeValueFactory {
  static numeric(name: string, defaultValue: number = 0): SafeValue<number> {
    return new SafeValue(name, defaultValue, parseFloat)
  }

  static stringCollection(name: string, defaultValue: []): SafeValue<string[]> {
    return new SafeValue(name, defaultValue, r => r)
  }

  static numericRecord(name: string, defaultValue: Record<string, number> = {}): SafeValue<Record<string, number>> {
    return new SafeValue(name, defaultValue, (raw) => {
      const transformed: Record<string, number> = {}
      Object.keys(raw).forEach((key: string) => {
        transformed[key] = parseFloat(raw[key])
      })
      return transformed
    })
  }
}