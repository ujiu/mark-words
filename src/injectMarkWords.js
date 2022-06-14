export const modeDict = {
  // delete: 0,
  add: 1,
  modify: 2,
  merge: 3,
  // 0: 'delete',
  1: 'add',
  2: 'modify',
  3: 'merge',
}

function updateMap(mark) {
  const temp = {}
  ;[...document.querySelectorAll(`[data-${mark}]`)].forEach(item => {
    temp[item.dataset[mark]] = item.firstChild
  })
  console.log(temp)
  return temp
}

/**
 * 一个划词方法
 * @param {string} selector css selector
 * @param {function} callback expose mark element to outsied.
 */
function injectMarkWords(selector, callback) {
  const MARK = 'mark'
  let markMap = {}
  ;[...document.querySelectorAll(`[data-${MARK}]`)].forEach(item => {
    markMap[item.dataset[MARK]] = item.firstChild
  })

  console.log(markMap)

  // ---------------

  const target = document.querySelector(selector)
  if (!target) throw new Error(`Error: ${selector} element is not exist.`)

  window.addEventListener('mouseup', e => {
    // 选择器不存在时，返回
    if (!e.path.includes(target)) return

    const selObj = document.getSelection()

    // 不存在选区时返回
    if (selObj.isCollapsed || selObj.type !== 'Range') return

    // 开始或结束节点类型不是文本节点时，返回
    const rangeObj = selObj.getRangeAt(0)
    const { startContainer, endContainer } = rangeObj
    if (startContainer.nodeName !== '#text' || endContainer.nodeName !== '#text') return

    // 选区内包含多个标记节点时，返回
    const rangeFrag = rangeObj.cloneContents()
    console.log(rangeFrag)
    const markNodes = rangeFrag.querySelectorAll(`[data-${MARK}]`)
    if (markNodes.length > 1) return

    // 内部 mark 节点只有一个时，走修改逻辑
    const { endOffset, startOffset } = rangeObj
    if (markNodes.length === 1) {
      const innerMarkNode = markNodes[0]
      const innerMarkText = markMap[innerMarkNode.dataset[MARK]]
      const [startContent, endContent] = [startContainer.textContent, endContainer.textContent]

      // 情况1: range 起始点都不在 mark node 中
      if (startContainer !== innerMarkText && endContainer !== innerMarkText) {
        innerMarkText.data = `${startContent.slice(startOffset)}${
          innerMarkText.data
        }${endContent.slice(0, endOffset)}`

        startContainer.data = startContent.slice(0, startOffset)
        endContainer.data = endContent.slice(endOffset)
        selObj.removeRange(rangeObj)
        return
      }

      // 情况2: range 起点是 mark node
      if (startContainer === innerMarkText) {
        innerMarkText.data = `${innerMarkText.data}${endContent.slice(0, endOffset)}`
        endContainer.data = endContent.slice(endOffset)
        selObj.removeRange(rangeObj)
        return
      }

      // 情况3: range 终点是 mark node
      if (endContainer === innerMarkText) {
        innerMarkText.data = `${startContent.slice(startOffset)}${innerMarkText.data}`
        startContainer.data = startContent.slice(0, startOffset)
        selObj.removeRange(rangeObj)
        return
      }
    }

    // 起始点都在 mark node 内时，走修改逻辑
    const { anchorOffset, focusOffset, anchorNode } = selObj
    const [start, end] = [anchorOffset, focusOffset].sort((a, b) => a - b)
    const { textContent } = anchorNode
    if (startContainer === endContainer && MARK in startContainer.parentElement.dataset) {
      console.log(startContainer, endContainer, startOffset, endOffset)
      const prevText = rangeObj.commonAncestorContainer.parentElement.previousSibling
      const prevStr = textContent.slice(0, start)
      prevText.data = prevText.textContent + prevStr

      const nextText = rangeObj.commonAncestorContainer.parentElement.nextSibling
      const nextStr = textContent.slice(end)
      nextText.data = nextStr + nextText.textContent

      const selStr = textContent.slice(start, end)
      rangeObj.commonAncestorContainer.data = selStr
      selObj.removeRange(rangeObj)
      return
    }

    if (startContainer !== endContainer) return

    // add

    const prevStr = textContent.slice(0, start)
    const selStr = textContent.slice(start, end)
    const nextStr = textContent.slice(end)
    const fragment = rangeObj.createContextualFragment(
      `${prevStr}<span data-${MARK}="${Date.now()}">${selStr}</span>${nextStr}`,
    )

    anchorNode.replaceWith(fragment)
    markMap = updateMap(MARK)
    // add
    callback(null, modeDict.add)
  })
}

export default injectMarkWords
