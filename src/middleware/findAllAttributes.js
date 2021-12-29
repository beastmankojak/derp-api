const _ = require('lodash');

const findAllAttributes = ({ statsCollection, traitsCollection }) => async (req, res) => {
  const stats = await statsCollection.findOne({});
  const attributes = (await traitsCollection.find({}).toArray()).map((trait) => {
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
};

module.exports = findAllAttributes;