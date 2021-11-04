const applyRoutes = (app, mongoClient) => {
  const derpCollection = mongoClient.db('derp').collection('derpMeta');
  const eggCollection = mongoClient.db('derp').collection('eggMeta');

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

    // const egg = await eggCollection.findOne({ 'eggId': `DE${eggId}` });
    const egg = await eggCollection.aggregate([
      { $match: { eggId: `DE${eggId}` } },
      { $lookup: { 
        from: 'derpMeta',
        localField: 'yChromo',
        foreignField: 'derpId',
        as: 'parent'
      } },
      { $project: {
        eggId: 1, hatchDate: 1, image: 1, name: 1, perfect: 1, symbol: 1, xChromo: 1,
        parent: { $arrayElemAt: [ '$parent', 0 ] }  
      } }
    ]).next();
    res.send({ egg });
  });
  
  app.get('/address/:address', (req, res) => {
  
  });  
};

module.exports = applyRoutes;