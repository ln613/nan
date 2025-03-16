export const replaceWithObj = (obj, str) => {
  if (str.startsWith('x => ')) {
    const func = eval(str)
    return func(obj)
  } else {
    return str.replace(/\{([^{}]+)\}/g, (match, key) => {
      const value = obj[key]
      return value !== undefined ? value : match
    })
  }
}
