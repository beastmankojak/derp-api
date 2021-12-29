const findById = ({ nameFn, collection, resultProp }) => async (req, res) => {
  const { id } = res.locals;
  const name = nameFn(id);
  const asset = await collection.findOne({ name });
  res.send({ [resultProp]: asset });
};

module.exports = findById;