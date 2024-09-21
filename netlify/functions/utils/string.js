export const pad0 = (n, d) => {
  const ad = Math.abs(d)
  const nl = n.toString().length
  if (ad <= nl) return n
  const pad = [...new Array(ad - nl)].map(x => '0').join('')
  return d > 0 ? n + pad : pad + n
}

export const trimFrom = (s, f) => s.slice(0, s.indexOf(f))

export const trimLeft = (s, l) => {
  while (s.startsWith(l)) {
    s = s.slice(l.length)
  }
  return s
}

export const trimRight = (s, l) => {
  while (s.endsWith(l)) {
    s = s.slice(0, -l.length)
  }
  return s
}
