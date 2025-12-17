import './style.css'
import Alpine from 'alpinejs'

window.Alpine = Alpine
Alpine.start()

const data = {
  message: 'From Alpine!'
}
Alpine.store('data', data)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <p x-data="$store.data">
    <span x-text="message">Not Init</span>
  </p>
`