import './style.css'
import paragraph from './paragraph'

document.querySelector('#app').innerHTML = paragraph

window.addEventListener('mouseup', () => {
  const selObj = document.getSelection()
  const { anchorOffset, focusOffset, anchorNode } = selObj

  const [start, end] = [anchorOffset, focusOffset].sort()

  const { textContent } = anchorNode
  console.log(anchorNode)
  const selStr = textContent.slice(start, end)
  anchorNode.parentElement.innerHTML = `${textContent.slice(
    0,
    start,
  )}<strong style="color: tomato;">{{${selStr}}}</strong>${textContent.slice(end)}`
})
