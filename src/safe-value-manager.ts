export class SafeValueManager {
  static keys: string[] = []

  static register(key: string) {
    if (this.keys.includes(key)) return
    this.keys.push(key)
  }

  static erase() {
    this.keys.forEach(key => {
      localStorage.removeItem(key)
    })
  }
}