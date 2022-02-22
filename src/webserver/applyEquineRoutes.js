const validateSortAndPageParams = require('../middleware/validateSortAndPageParams');
// const findAllAssets = require('../middleware/findAllAssets');
const findAllAttributes = require('../middleware/findAllAttributes');
const validateId = require('../middleware/validateId');
const findById = require('../middleware/findById');

const exactTraits = [
  'Back Left Leg', 'Back Right Leg', 'Body', 'Color', 'Front Left Leg', 'Front Right Leg', 'Gender', 'Head', 
];

const numericTraits = [
  'Age', 'acceleration', 'agility', 'endurance', 'speed', 'stamina', 'total'
];

const sortMap = {
  nameAsc: { name: 1 },
  nameDesc: { name: -1 },
  rankAsc: { rank: 1 },
  rankDesc: { rank: -1 },
  totalAsc: { total: 1 },
  totalDesc: { total: -1 },
};

const qOps = {
  '>': '$gt',
  '>=': '$gte',
  '<': '$lt',
  '<=': '$lte',
}

const numericTraitRx = /(>|>=|<|<=)?\s*(\d+)/;
const numericTraitToQuery = (val) => {
  const match = val.match(numericTraitRx);
  if (!match) {
    throw new Error(`Unexpected numeric value: ${val}`);
  }

  const [, op, digitStr] = match;
  const digits = parseInt(digitStr, 10);
  if (!op) {
    return digits;
  }

  const qOp = qOps[op];
  if (!qOp) {
    throw new Error(`Unexpected numeric value: ${val}`);
  }

  return { [qOp]: digits };
}

const findAllAssets = ({ exactTraits, numericTraits, mongoCollection }) => async (req, res) => {
  const { sort, limit, skip } = res.locals;
  const { query } = req;

  const exactQuery = exactTraits.reduce((acc, trait) => query[trait] ? ({
    ...acc,
    [trait]: query[trait],
  }) : acc, {});

  const numericQuery = numericTraits.reduce((acc, trait) => query[trait] ? ({
    ...acc,
    [trait]: numericTraitToQuery(query[trait])
  }) : acc, {})

  const q = { ...exactQuery, ...numericQuery };

  console.log(q, sortMap[sort], skip, limit);

  const assets = await mongoCollection.find(
    { ...exactQuery, ...numericQuery }, 
    { sort: sortMap[sort], skip, limit }
  ).toArray();
  res.send(assets);
};

const applyRoutes = (app, mongoClient) => {
  const equineDb = mongoClient.db('equine');

  const horseCollection = equineDb.collection('horsesMeta');
  const horseTraits = equineDb.collection('horsesTraits');
  const horseStats = equineDb.collection('horsesStats');

  app.get('/horses/', 
    validateSortAndPageParams(14166, { sortRx: /^(name|rank|total)(Asc|Desc)$/ }),
    findAllAssets({ exactTraits, numericTraits, mongoCollection: horseCollection })
  );

  app.get('/horses/attributes/', 
    findAllAttributes({ statsCollection: horseStats, traitsCollection: horseTraits })
  );

  app.get('/horses/:id', 
    validateId('00000'), 
    findById({ 
      nameFn: (id) => `Equine Pioneer Horse [${id}]`,
      collection: horseCollection,
      resultProp: 'horses', 
    }),
  );
};

module.exports = applyRoutes;
