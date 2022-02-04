const validateSortAndPageParams = require('../middleware/validateSortAndPageParams');
const findAllAssets = require('../middleware/findAllAssets');
const findAllAttributes = require('../middleware/findAllAttributes');
const validateId = require('../middleware/validateId');
const findById = require('../middleware/findById');

const traits = [
  'Fur', 'Body', 'Ears', 'Eyes', 'Head', 'Skin', 'Mouth', 'Background',
];

const applyRoutes = (app, mongoClient) => {
  const derpDb = mongoClient.db('derp');

  const drapesCollection = derpDb.collection('drapesMeta');
  const drapesTraits = derpDb.collection('drapesTraits');
  const drapesStats = derpDb.collection('drapesStats');

  app.get('/drapes/', 
    validateSortAndPageParams(8888),
    findAllAssets({ traits, mongoCollection: drapesCollection })
  );

  app.get('/drapes/attributes/', 
    findAllAttributes({ statsCollection: drapesStats, traitsCollection: drapesTraits })
  );

  app.get('/drapes/:id', 
    validateId('0000'), 
    findById({ 
      nameFn: (id) => `Derp Ape #0${id}`,
      collection: drapesCollection,
      resultProp: 'drapes', 
    }),
  );
};

module.exports = applyRoutes;