const twinsFilter = require('../filters/twinsFilter');
const _ = require('lodash');

const rockerSortMap = {
  nameAsc: { name: 1 },
  nameDesc: { name: -1 },
  rankAsc: { rank: 1 },
  rankDesc: { rank: -1 },
};

const pad = '0000';

const filter = (prop) => prop[Object.keys(prop)[0]] ? { ...prop } : {};

const applyRoutes = (app, mongoClient) => {
  const bacDb = mongoClient.db('bac');
  const rockerCollection = bacDb.collection('babyRockerMeta');
  const rockerTraits = bacDb.collection('rockerTraits');
  const rockerStats = bacDb.collection('rockerStats');

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

  
  // app.get('/address/:address', (req, res) => {
  
  // });  
};

module.exports = applyRoutes;