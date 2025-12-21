export class Console {
  static BG_PADDING = 'padding: 2px 4px'

  static CLEAR = `background-color: auto; color: auto; padding: auto; margin: auto; font-weight: auto`
  static EVENT = `background-color: purple; color: white; ${this.BG_PADDING}`
  static ID = `color: white; background-color: #0057ad; ${this.BG_PADDING}`
  static ACTION = `color: darkgreen; background-color: lightgreen; ${this.BG_PADDING}`
  static WARN = `color: darkred; background-color: lightred; ${this.BG_PADDING}`
  static TIME = `color: black; font-weight: bold; background-color: lightgray; border-radius: 1em; ${this.BG_PADDING}`
}