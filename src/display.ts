const NUMBERS = [
  1,
  1000,
  1000000,
  1000000000,
  1000000000000,
  1000000000000000,
  1000000000000000000,
  1000000000000000000000,
  1000000000000000000000000,
  1000000000000000000000000000,
  1000000000000000000000000000000,
  1000000000000000000000000000000000,
]
const LAST_NUMBER = NUMBERS[NUMBERS.length - 1]

const ABBREVIATIONS = [
  '',
  'K',
  'Mi',
  'Bi',
  'Tr',
  'Qu',
  'Qi',
  'Sx',
  'Sp',
  'Oc',
  'No',
  'Dc',
]
const LAST_ABBREVIATION = ABBREVIATIONS[ABBREVIATIONS.length - 1]

const NAMES = [
  '',
  'Thousand',
  'Million',
  'Billion',
  'Trillion',
  'Quadrillion',
  'Quintillion',
  'Sextillion',
  'Septillion',
  'Octillion',
  'Nonillion',
  'Decillion'
]
const LAST_NAME = NAMES[NAMES.length - 1]
const formatter = new Intl.NumberFormat('en-us', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
const shortFormatter = new Intl.NumberFormat('en-us', { maximumFractionDigits: 0 })

export class Display {
  humanNumber(num: number): string {
    const offset = this.offsetFor(num) 
    const divider = NUMBERS[offset] !== undefined ? NUMBERS[offset] : LAST_NUMBER
    const name = NAMES[offset] !== undefined ? NAMES[offset] : LAST_NAME
    const display = formatter.format(num / divider)

    return `${display} ${name}`
  }

  humanAbbreviatedNumber(num: number): string {
    const offset = this.offsetFor(num)
    const divider = NUMBERS[offset] !== undefined ? NUMBERS[offset] : LAST_NUMBER
    const name = ABBREVIATIONS[offset] !== undefined ? ABBREVIATIONS[offset] : LAST_ABBREVIATION
    const display = formatter.format(num / divider)

    return `${display} ${name}`
  }

  humanShortAbbreviatedNumber(num: number): string {
    const offset = this.offsetFor(num)
    const divider = NUMBERS[offset] !== undefined ? NUMBERS[offset] : LAST_NUMBER
    const name = ABBREVIATIONS[offset] !== undefined ? ABBREVIATIONS[offset] : LAST_ABBREVIATION
    const display = shortFormatter.format(num / divider)

    return `${display} ${name}`
  }

  percentFor(value: number) {
    return `${formatter.format(100 * value)}%`
  }

  private offsetFor(num: number): number {
    let offset = undefined
    let current = NUMBERS.length - 1

    while (offset === undefined && NUMBERS[current]) {
      const divider = NUMBERS[current]
      const value = num / divider

      if (value > 1) {
        offset = current
      }

      current -= 1
    }

    return offset === undefined ? 0 : offset
  }
}