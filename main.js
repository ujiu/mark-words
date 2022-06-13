import './src/style.css'
import paragraph from './src/paragraph'
import injectMarkWords from './src/injectMarkWords'

const root = document.querySelector('#app')
root.innerHTML = paragraph

injectMarkWords('#app', ([textNode], mode) => {
  console.log(textNode, mode)
  if (mode === 1) {
    createInput(textNode)
  }
})

function createInput(textNode) {
  const input = document.createElement('input')
  input.value = textNode.data
  input.oninput = e => {
    textNode.data = e.target.value
  }
  root.appendChild(input)
}
