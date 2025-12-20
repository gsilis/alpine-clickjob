import { SafeValue } from "./safe-value"

export class SafeValueFactory {
  static numeric(name: string, defaultValue: number = 0): SafeValue<number> {
    return new SafeValue(name, defaultValue, parseFloat)
  }

  static stringCollection(name: string, defaultValue: []): SafeValue<string[]> {
    return new SafeValue(name, defaultValue, r => r)
  }
}