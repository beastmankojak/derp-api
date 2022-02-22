const validateId = (pad) => (req, res, next) => {
  const {length} = pad;
  const { params: { id } } = req;
  if (!id || !new RegExp(`^\\d{1,${length}}$`).test(id)) {
    return res.status(400).send({ error: `id must be a number up to ${length} digits long`});
  }

  res.locals.id = `${pad.slice(0, -id.length)}${id}`
  next();
}

module.exports = validateId;