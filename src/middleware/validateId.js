const validateId = (pad) => (req, res, next) => {
  const { params: { id } } = req;
  if (!id || !/^\d{1,4}$/.test(id)) {
    return res.status(400).send({ error: 'id must be a number up to four digits long'});
  }

  res.locals.id = `${pad.slice(0, -id.length)}${id}`
  next();
}

module.exports = validateId;