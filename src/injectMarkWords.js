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

/**
 * 一个划词方法
 * @param {string} selector css selector
 * @param {function} callback expose mark element to outsied.
 */
function injectMarkWords(selector, callback) {
  const MARK = 'mark'
  const markMap = {}
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

    // 选区内包含标记节点时，返回
    const rangeFrag = rangeObj.cloneContents()
    const markNodes = rangeFrag.querySelectorAll(`[data-${MARK}]`)
    if (markNodes.length > 1) return

    // 内部 mark 节点只有一个时，走修改逻辑
    if (markNodes.length === 1) {
      const { endOffset, startOffset } = rangeObj
      const [startContent, endContent] = [startContainer.textContent, endContainer.textContent]
      console.log(startContainer, endContainer, startOffset, endOffset)

      // markMap[markNodes[0].dataset[MARK]].data = `${startContent.slice(startOffset)}${
      //   markNodes[0].textContent
      // }${endContent.slice(0, endOffset)}`

      // startContainer.data = startContent.slice(0, startOffset)
      // endContainer.data = endContent.slice(endOffset)
      // selObj.removeRange(rangeObj)
      return
    }

    // add
    const { anchorOffset, focusOffset, anchorNode } = selObj
    const [start, end] = [anchorOffset, focusOffset].sort((a, b) => a - b)
    const { textContent } = anchorNode

    const prevStr = textContent.slice(0, start)
    const selStr = textContent.slice(start, end)
    const nextStr = textContent.slice(end)
    const fragment = rangeObj.createContextualFragment(
      `${prevStr}<span data-${MARK}>${selStr}</span>${nextStr}`,
    )

    anchorNode.replaceWith(fragment)
    // add
    callback(null, modeDict.add)
  })
}

export default injectMarkWords
