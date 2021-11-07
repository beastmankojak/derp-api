const lookup = {
  yes: { perfect: { $ne: '' } },
  no: { perfect: { $eq: '' } }
};

const perfectEggFilter = (perfect) => {
  const yesOrNo = lookup[perfect];
  if (yesOrNo) {
    return yesOrNo;
  }

  return perfect ? { perfect } : {};
}

module.exports = perfectEggFilter;