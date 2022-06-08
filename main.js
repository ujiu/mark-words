import './style.css'
import paragraph from './paragraph'

document.querySelector('#app').innerHTML = paragraph

function injectMarkWords(selector, callback) {
  const target = document.querySelector(selector)
  if (!target) {
    throw new Error(`Error: ${selector} element is not exist.`)
  }

  window.addEventListener('mouseup', e => {
    if (!e.path.includes(target)) return

    const flag = 'mark'
    const selObj = document.getSelection()

    // if not select anything. return.
    if (selObj.type !== 'Range') return

    const { startContainer, endContainer } = selObj.getRangeAt(0)

    // whether select start point & end point in the same text-node.
    if (startContainer !== endContainer || startContainer.nodeName !== '#text') return

    // nested mark is not allowed
    if (flag in startContainer.parentNode.dataset) return

    const { anchorOffset, focusOffset, anchorNode } = selObj
    const [start, end] = [anchorOffset, focusOffset].sort()
    const { textContent } = anchorNode

    const prevStr = textContent.slice(0, start)
    const prevTextNode = document.createTextNode(prevStr)

    const selStr = textContent.slice(start, end)
    const markedElementNode = document.createElement('strong')
    markedElementNode.classList.add(flag)
    markedElementNode.dataset[flag] = ''
    markedElementNode.innerText = selStr

    const nextStr = textContent.slice(end)
    const nextTextNode = document.createTextNode(nextStr)

    const fragment = document.createDocumentFragment()
    fragment.append(prevTextNode, markedElementNode, nextTextNode)

    anchorNode.replaceWith(fragment)
    callback(markedElementNode)
  })
}

injectMarkWords('#app', markedElementNode => {
  console.log(markedElementNode)
})
