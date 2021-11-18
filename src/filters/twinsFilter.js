const twinsFilter = (twins) => {
  return twins ? { twin: { $exists: twins === 'yes' ? 1 : 0 } } : {};
}

module.exports = twinsFilter;