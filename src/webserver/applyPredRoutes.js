const validateSortAndPageParams = require('../middleware/validateSortAndPageParams');
const findAllAssets = require('../middleware/findAllAssets');
const findAllAttributes = require('../middleware/findAllAttributes');
const validateId = require('../middleware/validateId');
const findById = require('../middleware/findById');

const traits = [
  'Body', 'Eyes', 'Head', 'Rank', 'Head Gear', 'Back Gear', 'Front Gear', 'Background', 'Skin Color', 'Adaptive Color',
];

const applyRoutes = (app, mongoClient) => {
  const derpDb = mongoClient.db('derp');

  const predCollection = derpDb.collection('predMeta');
  const predTraits = derpDb.collection('predTraits');
  const predStats = derpDb.collection('predStats');

  app.get('/pred/', 
    validateSortAndPageParams(16000),
    findAllAssets({ traits, mongoCollection: predCollection })
  );

  app.get('/pred/attributes/', 
    findAllAttributes({ statsCollection: predStats, traitsCollection: predTraits })
  );

  app.get('/pred/:id', 
    validateId('00000'), 
    findById({ 
      nameFn: (id) => `Pred #${id}`,
      collection: predCollection,
      resultProp: 'preds', 
    }),
  );
};

module.exports = applyRoutes;