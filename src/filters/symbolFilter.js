const square = { symbol: '▢' };
const triangle = { symbol: '▽' };
const lookup = {
  '▢': square,
  '▽': triangle,
  square,
  triangle
};

const symbolFilter = (symbol) => lookup[symbol] || {};

module.exports = symbolFilter;