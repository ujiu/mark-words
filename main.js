import './src/style.css'
import paragraph from './src/paragraph'
import { modeDict, injectMarkWords } from './src/injectMarkWords'

const root = document.querySelector('#app')
root.innerHTML = paragraph

injectMarkWords('#app', (markMap, mode) => {
  console.log(markMap, mode)
})

function createInput(textNode) {
  const input = document.createElement('input')
  input.value = textNode.data
  input.oninput = e => {
    textNode.data = e.target.value
  }
  root.appendChild(input)
}
