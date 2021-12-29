const _ = require('lodash');

const validateSortAndPageParams = require('../middleware/validateSortAndPageParams');
const findAllAssets = require('../middleware/findAllAssets');
const findAllAttributes = require('../middleware/findAllAttributes');
const validateId = require('../middleware/validateId');
const findById = require('../middleware/findById');

const sortMap = {
  nameAsc: { name: 1 },
  nameDesc: { name: -1 },
  rankAsc: { rank: 1 },
  rankDesc: { rank: -1 },
};
const rockerSortMap = sortMap;
const spaceshipSortMap = sortMap;
const christmasTraits = [
  'hat', 'body', 'eyes', 'face', 'clothes', 'texture', 'accessory', 'background',
];

const pad = '0000';

const filter = (prop) => prop[Object.keys(prop)[0]] ? { ...prop } : {};

const applyRoutes = (app, mongoClient) => {
  const bacDb = mongoClient.db('bac');
  const rockerCollection = bacDb.collection('babyRockerMeta');
  const rockerTraits = bacDb.collection('rockerTraits');
  const rockerStats = bacDb.collection('rockerStats');
  const spaceshipCollection = bacDb.collection('bacSpaceshipMeta');
  const spaceshipTraits = bacDb.collection('bacSpaceshipTraits');
  const spaceshipStats = bacDb.collection('bacSpaceshipStats');

  const bacChristmasCollection = bacDb.collection('bacChristmasMeta');
  const bacChristmasTraits = bacDb.collection('bacChristmasTraits');
  const bacChristmasStats = bacDb.collection('bacChristmasStats');

  app.get('/baby-rocker/', async (req, res) => {
    const { query: { hat, body, eyes, mouth, clothes, accessory, background, sort = 'nameAsc', page, pageSize } } = req;

    if (sort && !/^(name(Asc|Desc))|(rank(Asc|Desc))$/.test(sort)) {
      return res.status(400).send({ error: 'param invalid: sort' });
    }
    if (page && !/^\d+$/.test(page)) {
      return res.status(400).send({ error: 'param invalid: page' });
    }
    if (pageSize && !/^\d+$/.test(pageSize)) {
      return res.status(400).send({ error: 'param invalid: pageSize' });
    }

    const limit = pageSize ? parseInt(pageSize, 10) : 50;
    if (limit < 0 || limit > 200) {
      return res.status(400).send({ error: 'page size must be between 1 and 200' });
    }
    const skip = page ? (parseInt(page, 10) - 1) * limit : 0;
    if (skip < 0 || skip > 3300) {
      return res.status(400).send({ error: 'computed offset must be between 1 and 3300' });
    }

    const query = {
      ...filter({hat}),
      ...filter({body}),
      ...filter({eyes}),
      ...filter({mouth}),
      ...filter({clothes}),
      ...filter({accessory}),
      ...filter({background}),
    };

    const babyRockers = await rockerCollection.find(query, { sort: rockerSortMap[sort], skip, limit }).toArray();
    res.send(babyRockers);
  });

  app.get('/baby-rocker/attributes/', async (req, res) => {
    const stats = await rockerStats.findOne({});
    const attributes = (await rockerTraits.find({}).toArray()).map((trait) => {
      const { _id, values } = trait;
      return { 
        _id,
        values: _.sortBy(values, ['count'])
          .map(({name, count, pct}) => {
            // const value = Object.keys(t)[0];
            return {
              label: `${name} (${count} / ${pct.toFixed(2)}%)`,
              value: name
            };
          })
      };
    }).reduce((acc, curr) => ({ ...acc, [curr._id]: curr.values}), {});
    res.send({stats, attributes});
  });

  app.get('/baby-rocker/:rockerId', async (req, res) => {
    const { params: { rockerId } } = req;
    const [ ,rockerNum ] = rockerId.match(/^(?:BabyAlienRock0*)?(\d{1,4})$/) || [];
    if (!rockerNum) {
      return res.status(400).send({ error: 'rockerId must be a four digit number, optionally preceded by "BabyAlienRock"'});
    }

    const name = `BabyAlienRock${pad.slice(0, -rockerNum.length)}${rockerNum}`;
    const babyRocker = await rockerCollection.findOne({ name });
    res.send({ babyRocker });
  });

  app.get('/bac-spaceship/', async (req, res) => {
    const { query: { 
      arms, ship, type, cabin, cargo, effect, lights, weapon, 
      texture, parasites, background, propulsion,
      sort = 'nameAsc', page, pageSize 
    } } = req;

    if (sort && !/^(name(Asc|Desc))|(rank(Asc|Desc))$/.test(sort)) {
      return res.status(400).send({ error: 'param invalid: sort' });
    }
    if (page && !/^\d+$/.test(page)) {
      return res.status(400).send({ error: 'param invalid: page' });
    }
    if (pageSize && !/^\d+$/.test(pageSize)) {
      return res.status(400).send({ error: 'param invalid: pageSize' });
    }

    const limit = pageSize ? parseInt(pageSize, 10) : 50;
    if (limit < 0 || limit > 200) {
      return res.status(400).send({ error: 'page size must be between 1 and 200' });
    }
    const skip = page ? (parseInt(page, 10) - 1) * limit : 0;
    if (skip < 0 || skip > 10000) {
      return res.status(400).send({ error: 'computed offset must be between 1 and 10000' });
    }

    const query = {
      ...filter({arms}),
      ...filter({ship}),
      ...filter({type}),
      ...filter({cabin}),
      ...filter({cargo}),
      ...filter({effect}),
      ...filter({lights}),
      ...filter({weapon}),
      ...filter({texture}),
      ...filter({parasites}),
      ...filter({background}),
      ...filter({propulsion}),
    };

    const spaceships = await spaceshipCollection.find(query, { sort: spaceshipSortMap[sort], skip, limit }).toArray();
    res.send(spaceships);
  });

  app.get('/bac-spaceship/attributes/', async (req, res) => {
    const stats = await spaceshipStats.findOne({});
    const attributes = (await spaceshipTraits.find({}).toArray()).map((trait) => {
      const { _id, values } = trait;
      return { 
        _id,
        values: _.sortBy(values, ['count'])
          .map(({name, count, pct}) => {
            // const value = Object.keys(t)[0];
            return {
              label: `${name} (${count} / ${pct.toFixed(2)}%)`,
              value: name
            };
          })
      };
    }).reduce((acc, curr) => ({ ...acc, [curr._id]: curr.values}), {});
    res.send({stats, attributes});
  });

  app.get('/bac-spaceship/:spaceshipId', async (req, res) => {
    const { params: { spaceshipId } } = req;
    if (!spaceshipId || !/^\d{1,4}$/.test(spaceshipId)) {
      return res.status(400).send({ error: 'spaceship id must be a number up to four digits long'});
    }

    const name = `BAC Spaceship [${pad.slice(0, -spaceshipId.length)}${spaceshipId}]`;
    const spaceship = await spaceshipCollection.findOne({ name });
    res.send({ spaceship });
  });

  app.get('/bac-christmas/', 
    validateSortAndPageParams(300),
    findAllAssets({ traits: christmasTraits, mongoCollection: bacChristmasCollection })
  );

  app.get('/bac-christmas/attributes/', 
    findAllAttributes({ statsCollection: bacChristmasStats, traitsCollection: bacChristmasTraits })
  );

  app.get('/bac-christmas/:id', 
    validateId('0000'), 
    findById({ 
      nameFn: (id) => `BabyAlienChristmas${id}`,
      collection: bacChristmasCollection,
      resultProp: 'bacChristmas', 
    }),
  );
  
  // app.get('/address/:address', (req, res) => {
  
  // });  
};

module.exports = applyRoutes;