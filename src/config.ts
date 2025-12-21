import { SafeValueFactory } from "./safe-value-factory";

export class Config {
  priceMultiplier = SafeValueFactory.numeric('game.price-multiplier', 1.15)
  sellPercentage = SafeValueFactory.numeric('game.sell-percentage', 0.3)
}