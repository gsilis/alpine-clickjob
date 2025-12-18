import { SafeValue } from "./safe-value";

export class Config {
  priceMultiplier = new SafeValue('game.price-multiplier', 1.15, s => s)
}