import type { Unlock, UnlockGameStateProcessor, UnlockInstaller } from "./unlocks";

export class UnlockFactory {
  create(
    id: string,
    title: string,
    description: string,
    effectDescription: string,
    price: number,
    getStateFrom: UnlockGameStateProcessor, 
    install: UnlockInstaller
  ): Unlock {
    return {
      id,
      title,
      description,
      effectDescription,
      price,
      state: 0,
      getStateFrom,
      install,
      get available() { return this.state > 0 },
      get installed() { return this.state > 1 },
    }
  }

  createAutomatic(
    id: string,
    getStateFrom: UnlockGameStateProcessor,
    install: UnlockInstaller
  ): Unlock {
    return {
      id,
      title: `unlock ${id}`,
      description: `generated unlock for ${id}`,
      effectDescription: `no description for ${id}`,
      price: 0,
      state: 0,
      getStateFrom,
      install,
      get available() { return this.state > 0 },
      get installed() { return this.state > 1 },
    }
  }
}