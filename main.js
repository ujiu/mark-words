import './src/style.css'
import paragraph from './src/paragraph'
import { modeDict } from './src/injectMarkWords'
import injectMarkWords from './src/injectMarkWords'

const root = document.querySelector('#app')
root.innerHTML = paragraph

injectMarkWords('#app', (_, mode) => {
  // alert(modeDict[mode])
})

function createInput(textNode) {
  const input = document.createElement('input')
  input.value = textNode.data
  input.oninput = e => {
    textNode.data = e.target.value
  }
  root.appendChild(input)
}
