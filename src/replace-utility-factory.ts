import { ReplaceUtility } from "./replace-utility";

export class ReplaceUtilityFactory {
  static create(patterns: Record<string, string>) {
    const reg = new ReplaceUtility()
    Object.keys(patterns).forEach((key) => {
      reg.add(key, patterns[key])
    })
    return reg
  }
}