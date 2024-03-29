const perfectEggFilter = require('../filters/perfectEggFilter');
const parentPerfectEggFilter = require('../filters/parentPerfectEggFilter');
const symbolFilter = require('../filters/symbolFilter');
const xChromoFilter = require('../filters/xChromoFilter');
const yChromoFilter = require('../filters/yChromoFilter');
const twinsFilter = require('../filters/twinsFilter');
const _ = require('lodash');

const sortMap = {
  eggIdAsc: { eggId: 1 },
  eggIdDesc: { eggId: -1 },
};

const derplingSortMap = {
  derplingIdAsc: { derplingId: 1 },
  derplingIdDesc: { derplingId: -1 },
  hatchAsc: { _id: 1 },
  hatchDesc: { _id: -1 },
  rankAsc: { rank: 1 },
  rankDesc: { rank: -1 },
};

const filter = (prop) => prop[Object.keys(prop)[0]] ? { ...prop } : {};

const applyRoutes = (app, mongoClient) => {
  const derpDb = mongoClient.db('derp');
  const derpCollection = derpDb.collection('derpMeta');
  const eggCollection = derpDb.collection('eggsWithParent');
  const derplingCollection = derpDb.collection('derplingMeta');
  const derplingTraits = derpDb.collection('derplingTraits');
  const derplingStats = derpDb.collection('derplingStats');

  app.get('/derp-birds/:derpId', async (req, res) => {
    const { params: { derpId } } = req;
    if (!/\d{5}/.test(derpId)) {
      return res.status(400).send({ error: 'derpId must be a five digit number'});
    }

    const derp = await derpCollection.aggregate([
      { $match: { derpId: `DP${derpId}` } },
      { $lookup: { 
        from: 'eggMeta',
        localField: 'derpId',
        foreignField: 'yChromo',
        as: 'eggs'
      } }
    ]).next();
    res.send({ derp });
  });
  
  app.get('/derp-eggs/:eggId', async (req, res) => {
    const { params: { eggId } } = req;
    if (!/\d{5}/.test(eggId)) {
      return res.status(400).send({ error: 'eggId must be a five digit number'});
    }

    const egg = await eggCollection.findOne({ 'eggId': `DE${eggId}` });
    res.send({ egg });
  });

  app.get('/derp-eggs/', async (req, res) => {
    const { query: { perfect, symbol, xChromo, yChromo, parentPerfect, sort = 'eggIdAsc', page, pageSize } } = req;

    if (perfect && !/^(yes|no|redneck|dave|stoner|dj|diety|astro|viking|ghost|corpo|magic|monk|ninja|scientist|cyborg|buff)$/.test(perfect)) {
      return res.status(400).send({ error: 'param invalid: perfect' });
    }
    if(symbol && !/^(square|triangle|▢|▽)$/.test(symbol)) {
      return res.status(400).send({ error: 'param invalid: symbol' });
    }
    if (xChromo && !/^(single|double|crazy)$/.test(xChromo)) {
      return res.status(400).send({ error: 'param invalid: xChromo' });
    }
    if (yChromo && !/^DP(\d{5}|\?)$/.test(yChromo)) {
      return res.status(400).send({ error: 'param invalid: yChromo' });
    }
    if (parentPerfect && !/^(yes|no|redneck|dave|stoner|dj|diety|astro|viking|ghost|corpo|magic|monk|ninja|scientist|cyborg|buff)$/.test(perfect)) {
      return res.status(400).send({ error: 'param invalid: parentPerfect' });
    }
    if (sort && !/^eggId(Asc|Desc)$/.test(sort)) {
      return res.status(400).send({ eerror: 'param invalid: sort' });
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
    if (skip < 0 || skip > 15000) {
      return res.status(400).send({ error: 'computed offset must be between 1 and 15000' });
    }

    const query = {
      ...perfectEggFilter(perfect),
      ...symbolFilter(symbol),
      ...xChromoFilter(xChromo),
      ...yChromoFilter(yChromo),
      ...parentPerfectEggFilter(parentPerfect),
    };

    const egg = await eggCollection.find(query, { sort: sortMap[sort], skip, limit }).toArray();
    res.send(egg);
  });

  app.get('/derplings/', async (req, res) => {
    const { query: { aura, beak, body, eyes, head, cargo, color, gender, eggshell, pedestal, basecolor, dadbodTag, twins, sort = 'hatchAsc', page, pageSize } } = req;

    if (sort && !/^(derplingId(Asc|Desc))|(hatch(Asc|Desc))|(rank(Asc|Desc))$/.test(sort)) {
      return res.status(400).send({ eerror: 'param invalid: sort' });
    }
    if (twins && !/^(yes|no)$/.test(twins)) {
      return res.status(400).send({ error: 'param invalid: twins' });
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
    if (skip < 0 || skip > 7500) {
      return res.status(400).send({ error: 'computed offset must be between 1 and 7500' });
    }

    const query = {
      ...filter({aura}),
      ...filter({beak}),
      ...filter({body}),
      ...filter({eyes}),
      ...filter({head}),
      ...filter({cargo}),
      ...filter({color}),
      ...filter({gender}),
      ...filter({eggshell}),
      ...filter({pedestal}),
      ...filter({basecolor}),
      ...filter({dadbodTag}),
      ...twinsFilter(twins),
    };

    const derplings = await derplingCollection.find(query, { sort: derplingSortMap[sort], skip, limit }).toArray();
    res.send(derplings);
  });

  app.get('/derplings/attributes/', async (req, res) => {
    const stats = await derplingStats.findOne({});
    const attributes = (await derplingTraits.find({}).toArray()).map((trait) => {
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

  app.get('/derplings/:derplingId', async (req, res) => {
    const { params: { derplingId } } = req;
    const [ ,derplingNum ] = derplingId.match(/^(?:DR)?(\d{5})$/) || [];
    if (!derplingNum) {
      return res.status(400).send({ error: 'derplingId must be a five digit number, optionally preceded by DR'});
    }

    const derpling = await derplingCollection.findOne({ 'derplingId': `DR${derplingNum}` });
    res.send({ derpling });
  });

  
  // app.get('/address/:address', (req, res) => {
  
  // });  
};

module.exports = applyRoutes;