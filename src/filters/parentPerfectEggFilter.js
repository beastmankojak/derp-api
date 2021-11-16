const lookup = {
  yes: { 'parent.perfect': { $ne: '' } },
  no: { 'parent.perfect': { $eq: '' } }
};

const parentPerfectEggFilter = (perfect) => {
  const yesOrNo = lookup[perfect];
  if (yesOrNo) {
    return yesOrNo;
  }

  return perfect ? { 'parent.perfect': perfect } : {};
}

module.exports = parentPerfectEggFilter;