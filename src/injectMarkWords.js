/**
 * 一个划词方法
 * @param {string} selector css selector
 * @param {function} callback expose mark element to outsied.
 */
function injectMarkWords(selector, callback) {
  const target = document.querySelector(selector)
  if (!target) {
    throw new Error(`Error: ${selector} element is not exist.`)
  }

  const modeDict = {
    delete: 0,
    add: 1,
    modify: 2,
    merge: 3,
  }
  window.addEventListener('mouseup', e => {
    if (!e.path.includes(target)) return

    const mark = 'mark'
    const selObj = document.getSelection()
    const { startContainer, endContainer } = selObj.getRangeAt(0)
    const isContainMark =
      mark in startContainer.parentNode.dataset || mark in endContainer.parentNode.dataset

    // delete
    if (isContainMark && selObj.isCollapsed) {
      callback([startContainer], modeDict.delete)
      return
    }

    // if not select anything. return.
    if (selObj.type !== 'Range') return

    console.log(selObj, selObj.getRangeAt(0))

    // whether select start point & end point in the same text-node.
    if (startContainer !== endContainer) {
      if (startContainer.nodeName !== '#text') {
        // alert('不能跨元素选择')
        return
      }
    }
    // console.log(startContainer, endContainer)

    // nested mark is not allowed
    if (mark in startContainer.parentNode.dataset) return

    // add
    const { anchorOffset, focusOffset, anchorNode } = selObj
    const [start, end] = [anchorOffset, focusOffset].sort((a, b) => a - b)
    const { textContent } = anchorNode

    const prevStr = textContent.slice(0, start)
    const prevTextNode = document.createTextNode(prevStr)

    const selStr = textContent.slice(start, end)
    const markedElementNode = document.createElement('span')
    markedElementNode.dataset[mark] = ''
    markedElementNode.innerText = selStr

    const nextStr = textContent.slice(end)
    const nextTextNode = document.createTextNode(nextStr)

    const fragment = document.createDocumentFragment()
    fragment.append(prevTextNode, markedElementNode, nextTextNode)

    // anchorNode.replaceWith(fragment)
    callback([markedElementNode.firstChild], modeDict.add)
  })
}

export default injectMarkWords
