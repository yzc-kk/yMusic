export default function stringToNodes(keyword, value) {
  const nodes = []
  // keyword 以 value 开头
  if (keyword.toUpperCase().startsWith(value.toUpperCase())) {
    const sameKey = keyword.slice(0, value.length)
    const sameNode = {
      name: "span",
      attrs: {
        style: "color: #26ce8a; font-weight: bold; font-size: 14px; "
      },
      children: [
        {
          type: "text",
          text: sameKey
        }
      ]
    }
    nodes.push(sameNode)

    const otherKey = keyword.slice(value.length)
    const otherNode = {
      name: "span",
      attrs: {  style: "color: #000000; font-size: 14px; " },
      children: [  {
          type: "text",
          text: otherKey
        }  ]
    }
    nodes.push(otherNode)
  } else {
    const node = {
      name: "span",
      attrs: {
        style: "color: #000000; font-size: 14px; "
      },
      children: [
        {
          type: "text",
          text: keyword
        }
      ]
    }
    nodes.push(node)
  }
  return nodes
}