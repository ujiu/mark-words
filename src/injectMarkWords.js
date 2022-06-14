export const modeDict = { add: 1, modify: 2, 1: 'add', 2: 'modify' }

function getMarkMap(mark) {
  const temp = {}
  ;[...document.querySelectorAll(`[data-${mark}]`)].forEach(item => {
    temp[item.dataset[mark]] = item.firstChild
  })
  return temp
}

/**
 * 一个划词方法
 * @param {string} selector css selector
 * @param {function} callback expose mark element to outsied.
 */
function injectMarkWords(selector, callback) {
  const MARK = 'mark'
  let markMap = getMarkMap(MARK)

  const target = document.querySelector(selector)
  if (!target) throw new Error(`Error: ${selector} element is not exist.`)

  window.addEventListener('mouseup', e => {
    // 选取在选择器区域外时, 排除
    if (!e.path.includes(target)) return

    const selObj = document.getSelection()

    // 不存在选区或选区重叠时, 排除
    if (selObj.isCollapsed || selObj.type !== 'Range') return

    const rangeObj = selObj.getRangeAt(0)
    const { startContainer, endContainer } = rangeObj

    // 开始或结束节点类型不是文本节点时, 排除
    if (startContainer.nodeName !== '#text' || endContainer.nodeName !== '#text') return

    const rangeFrag = rangeObj.cloneContents()
    const markNodes = rangeFrag.querySelectorAll(`[data-${MARK}]`)

    // 选区内包含多个标记节点时, 排除
    if (markNodes.length > 1) return

    const commonParent = rangeObj.commonAncestorContainer
    const [startParent, endParent] = [startContainer.parentNode, endContainer.parentNode]
    const isSameText = startContainer === endContainer
    const isCrossSelect = !isSameText && commonParent !== startParent && commonParent !== endParent

    // 跨段选择时，排除
    if (isCrossSelect) return

    const { endOffset, startOffset } = rangeObj

    // 内部 mark 节点只有一个时，走修改逻辑
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

    const { anchorOffset, focusOffset, anchorNode } = selObj
    const [start, end] = [anchorOffset, focusOffset].sort((a, b) => a - b)
    const { textContent } = anchorNode

    const prevStr = textContent.slice(0, start)
    const selStr = textContent.slice(start, end)
    const nextStr = textContent.slice(end)
    const commonContainer = rangeObj.commonAncestorContainer

    // 起始点都在 mark node 内时，走修改逻辑
    if (isSameText && MARK in commonContainer.parentElement.dataset) {
      const { previousSibling: prevText, nextSibling: nextText } = commonContainer.parentElement
      const markNode = rangeObj.commonAncestorContainer.parentNode

      // mark node 左右相邻节点都是文本节点时
      if (prevText.nodeName === '#text' && nextText.nodeName === '#text') {
        prevText.data = prevText.textContent + prevStr
        commonContainer.data = selStr
        nextText.data = nextStr + nextText.textContent
      }

      let fragment = null

      // 前置节点非 Text
      if (prevText.nodeName !== '#text') {
        nextText.data = nextStr + nextText.textContent
        fragment = rangeObj.createContextualFragment(
          `${prevStr}<span data-${MARK}="${markNode.dataset[MARK]}">${selStr}</span>`,
        )
      }

      // 后置节点非 Text
      if (nextText.nodeName !== '#text') {
        prevText.data = prevText.textContent + prevStr
        fragment = rangeObj.createContextualFragment(
          `<span data-${MARK}="${markNode.dataset[MARK]}">${selStr}</span>${nextStr}`,
        )
      }

      // 前置后置节点皆非 Text
      if (prevText.nodeName !== '#text' && nextText.nodeName !== '#text') {
        fragment = rangeObj.createContextualFragment(
          `${prevStr}<span data-${MARK}="${markNode.dataset[MARK]}">${selStr}</span>${nextStr}`,
        )
      }

      if (fragment) markNode.replaceWith(fragment)

      selObj.removeRange(rangeObj)
      markMap = getMarkMap(MARK)
      return
    }

    // 新增
    const fragment = rangeObj.createContextualFragment(
      `${prevStr}<span data-${MARK}="${Date.now()}">${selStr}</span>${nextStr}`,
    )
    anchorNode.replaceWith(fragment)

    markMap = getMarkMap(MARK)

    // add
    // callback(null, modeDict.add)
  })
}

export default injectMarkWords
