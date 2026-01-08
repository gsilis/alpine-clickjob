import { Progression } from "../progression"
import { type Product } from '../game'
import AdOverlayIcon from '../images/ad-overlays.svg'
import InfluencerIcon from '../images/influencers.svg'
import SkipAdIcon from '../images/skip-ads.svg'
import EspressoIcon from '../images/expresso.svg'
import RageBaitIcon from '../images/rage-bait.svg'

const productPriceProgression = new Progression(15, 11)
const productivityProgression = new Progression(0.1, 5)

export const PRODUCTS: Product[] = [
  {
    id: 'ad-overlays', title: 'Ad Overlays',
    description: 'Layers upon layers of ads shown over the websites people are trying to visit.',
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
    iconSrc: AdOverlayIcon
  },
  {
    id: 'skip-ad-buttons', title: 'Skip Ad Buttons',
    description: `These are sure to generate clicks! People love waiting for the little timer on the skip button. It's usually set to nice music while you're paying attention to the countdown.`,
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
    iconSrc: SkipAdIcon
  },
  {
    id: 'influencers', title: 'Content Creators',
    description: 'Talking heads with large microphones suspended in front of their faces. Riveting.',
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
    iconSrc: InfluencerIcon
  },
  {
    id: 'espresso-makers', title: 'Espresso Makers',
    description: `Drink caffeine until your fingers twitch, this should increase the number of generated clicks!`,
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
    iconSrc: EspressoIcon
  },
  {
    id: 'rage-content', title: 'Rage Content Creators',
    description: `Talking heads with large microphones suspended in front of their faces. These ones are yelling though!`,
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
    iconSrc: RageBaitIcon
  },
  {
    id: 'energy-drinks', title: 'Energy Drinks™',
    description: `Caffeine not cutting it any more? Try this stuff instead. It can also power a formula 1 car until the engine explodes.`,
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
  },
  {
    id: 'click-farm', title: 'Click Farm',
    description: `As long as it's a free range click farm, the clicks should be good.`,
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
  },
  {
    id: 'bot-net', title: 'Bot Net',
    description: `We're not 100% sure this thing isn't self-aware, but it really pumps out the clicks.`,
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
  },
  {
    id: 'telepathy', title: 'Telepathy',
    description: `Use newly discovered mind powers to will people into clicking on things.`,
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
  },
  {
    id: 'diesel-powered-clicker', title: 'Diesel Powered Clicker',
    description: `We have all this fuel and spare engines laying around, get them rotating to generate some more clicks!`,
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
  },
  /*
  {
    id: '', title: '',
    description: ``,
    basePrice: productPriceProgression.next(),
    baseProductivity: productivityProgression.next(),
  },
  */
]