import './src/style.css'
import paragraph from './src/paragraph'
import injectMarkWords from './src/injectMarkWords'

document.querySelector('#app').innerHTML = paragraph

injectMarkWords('#app', textNode => {
  console.log(textNode)
})
