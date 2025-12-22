import type { Configurator } from "./configurator";
import type { Game, Upgrade } from "./game";
import type { Producers } from "./producers";
import type { Progression } from "./progression";

export class ProductUpgradeOutputter implements Configurator<Upgrade> {
  private unlockProgression: Progression
  private priceProgression: Progression
  private configs: Upgrade[] = []

  constructor(unlock: Progression, price: Progression) {
    this.unlockProgression = unlock
    this.priceProgression = price
  }

  add(id: string, title: string, boost: number, basePrice: number, description: string) {
    this.configs.push({
      id: `${id}-${id}`,
      productId: id,
      title: `${title} ${title}`,
      description: description.replace(/\{P\}/gi, title),
      effectDescription: `Increase the output of ${title} by ${boost * 100}%`,
      price: basePrice * this.priceProgression.next(),
      unlockAt: this.unlockProgression.next(),
      install: (_game: Game, producers: Producers) => {
        producers.find(id).boost(id, boost)
      }
    })
  }

  output(): Upgrade[] {
    return [...this.configs]
  }
}