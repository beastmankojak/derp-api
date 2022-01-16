const validateSortAndPageParams = require('../middleware/validateSortAndPageParams');
const findAllAssets = require('../middleware/findAllAssets');
const findAllAttributes = require('../middleware/findAllAttributes');
const validateId = require('../middleware/validateId');
const findById = require('../middleware/findById');

const muggoTraits = [
  "Muggo Back",
  "Muggo Head",
  "Muggo Rank",
  "Muggo Color",
  "Muggo Accessory",
  "Muggo Background",
  "Muggo Foreground",
  "Muggo Gameplay Proficiency",
  "Color Matched",
  "Sidekick",
  "Sidekick Gem",
  "Sidekick Ears",
  "Sidekick Horn",
  "Sidekick Nose",
  "Sidekick Teeth",
  "Sidekick Tummy",
  "Sidekick Wings",
];

const applyRoutes = (app, mongoClient) => {
  const bacDb = mongoClient.db('muggos');
  const muggosCollection = bacDb.collection('muggosMeta');
  const muggosTraits = bacDb.collection('muggosTraits');
  const muggosStats = bacDb.collection('muggosStats');

  app.get('/muggos/', 
    validateSortAndPageParams(1200),
    findAllAssets({ traits: muggoTraits, mongoCollection: muggosCollection })
  );

  app.get('/muggos/attributes/', 
    findAllAttributes({ statsCollection: muggosStats, traitsCollection: muggosTraits })
  );

  app.get('/muggos/:id', 
    validateId('00000'), 
    findById({ 
      nameFn: (id) => `Muggo #${id}`,
      collection: muggosCollection,
      resultProp: 'muggo', 
    }),
  );
};

module.exports = applyRoutes;