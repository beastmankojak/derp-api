const validateSortAndPageParams = require('../middleware/validateSortAndPageParams');
const findAllAssets = require('../middleware/findAllAssets');
const findAllAttributes = require('../middleware/findAllAttributes');
const validateId = require('../middleware/validateId');
const findById = require('../middleware/findById');

const traits = [
  'Beak', 'Body', 'Eyes', 'Head', 'Mouth', 'Background',
];

const applyRoutes = (app, mongoClient) => {
  const derpDb = mongoClient.db('derp');

  const baldoCollection = derpDb.collection('baldoMeta');
  const baldoTraits = derpDb.collection('baldoTraits');
  const baldoStats = derpDb.collection('baldoStats');

  app.get('/baldo/',
    validateSortAndPageParams(420),
    findAllAssets({ traits, mongoCollection: baldoCollection })
  );

  app.get('/baldo/attributes/',
    findAllAttributes({ statsCollection: baldoStats, traitsCollection: baldoTraits })
  );

  app.get('/baldo/:id',
    validateId('000'),
    findById({
      nameFn: (id) => `The Baldo Collective #${id}`,
      collection: baldoCollection,
      resultProp: 'baldos',
    }),
  );
};

module.exports = applyRoutes;