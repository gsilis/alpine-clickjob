import { Alpine as AlpineType } from 'alpinejs'
import type { Game } from './game'

declare global {
  var Alpine: AlpineType
  var game: Game
}