const lookup = {
  single: { xChromo: /^\[\[3rR0r\/\/[^-|_?=+<>!@#$%^&*(){},]*[-|_?=+<>!@#$%^&*(){}][^-|_?=+<>!@#$%^&*(){},]*\]\]$/ },
  double: { xChromo: /^\[\[3rR0r\/\/[^-|_?=+<>!@#$%^&*(){},]*[-|_?=+<>!@#$%^&*(){}][^-|_?=+<>!@#$%^&*(){},]*[-|_?=+<>!@#$%^&*(){}][^-|_?=+<>!@#$%^&*(){},]*\]\]$/ },
  crazy: { xChromo: /,/ }
}

const xChromoFilter = (xChromo) => lookup[xChromo] || {};

module.exports = xChromoFilter;