const sortMap = {
  nameAsc: { name: 1 },
  nameDesc: { name: -1 },
  rankAsc: { rank: 1 },
  rankDesc: { rank: -1 },
};

const findAllAssets = ({ traits, mongoCollection }) => async (req, res) => {
  const { sort, limit, skip } = res.locals;
  const { query } = req;

  const mongoQuery = traits.reduce((acc, trait) => query[trait] ? ({
    ...acc,
    [trait]: query[trait],
  }) : acc, {});

  const assets = await mongoCollection.find(
    mongoQuery, 
    { sort: sortMap[sort], skip, limit }
  ).toArray();
  res.send(assets);
};

module.exports = findAllAssets;