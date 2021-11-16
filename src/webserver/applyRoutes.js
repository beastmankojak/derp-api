const perfectEggFilter = require('../filters/perfectEggFilter');
const parentPerfectEggFilter = require('../filters/parentPerfectEggFilter');
const symbolFilter = require('../filters/symbolFilter');
const xChromoFilter = require('../filters/xChromoFilter');
const yChromoFilter = require('../filters/yChromoFilter');

const sortMap = {
  eggIdAsc: { eggId: 1 },
  eggIdDesc: { eggId: -1 },
};

const applyRoutes = (app, mongoClient) => {
  const derpCollection = mongoClient.db('derp').collection('derpMeta');
  const eggCollection = mongoClient.db('derp').collection('eggsWithParent');

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
  
  // app.get('/address/:address', (req, res) => {
  
  // });  
};

module.exports = applyRoutes;