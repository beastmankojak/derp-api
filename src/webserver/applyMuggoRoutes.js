const validateSortAndPageParams = require('../middleware/validateSortAndPageParams');
const findAllAssets = require('../middleware/findAllAssets');
const findAllAttributes = require('../middleware/findAllAttributes');
const validateId = require('../middleware/validateId');
const findById = require('../middleware/findById');
const getSwag = require('../blockfrost/getSwag');
const client = require('../blockfrost/client');

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

const swag = {
  stakeAddress: 'stake1u9rqdsv5r265rg2lyp3r8gannxu7wnwrm5vse8yqxgmknqs3f87s6',
  assets: [
    '7c466c27439332b84be4131cf8e43722800de2ac32fa267df9adbb0e426c75654d7567676f537761675061636b',
    '7c466c27439332b84be4131cf8e43722800de2ac32fa267df9adbb0e477265656e4d7567676f537761675061636b',
    '7c466c27439332b84be4131cf8e43722800de2ac32fa267df9adbb0e5265644d7567676f537761675061636b',
    '7c466c27439332b84be4131cf8e43722800de2ac32fa267df9adbb0e59656c6c6f774d7567676f537761675061636b',
    '7c466c27439332b84be4131cf8e43722800de2ac32fa267df9adbb0e476f6c644d7567676f4172746966616374',
    '7c466c27439332b84be4131cf8e43722800de2ac32fa267df9adbb0e53696c7665724d7567676f4172746966616374',
  ],
};

const PROJECT_ID = process.env.PROJECT_ID;
if (!PROJECT_ID) {
  throw new Error('Hey, you need to set the PROJECT_ID env var before running this server!');
}
const blockfrost = client({ projectId: PROJECT_ID });

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

  app.get('/muggos/swag/', async (req, res) => {
    const swagResult = await getSwag({ blockfrost, ...swag });
    res.send({ ...swagResult });
  });

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