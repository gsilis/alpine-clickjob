export class ReplaceUtility {
  private patterns: Record<string, [RegExp, string]> = {}

  add(key: string, value: string) {
    this.patterns[key] = [new RegExp(`\{${key}\}`, 'g'), value]
  }

  out(message: string) {
    return Object.keys(this.patterns).reduce((m, key) => {
      const [regexp, value] = this.patterns[key]
      return m.replace(regexp, value)
    }, message)
  }
}