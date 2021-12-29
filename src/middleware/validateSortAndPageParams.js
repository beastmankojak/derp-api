const validateSortAndPageParams = (collectionTotal) => (req, res, next) => {
  const { query: { 
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
  if (skip < 0 || skip > collectionTotal) {
    return res.status(400).send({ error: `computed offset must be between 1 and ${collectionTotal}` });
  }

  res.locals.sort = sort;
  res.locals.limit = limit;
  res.locals.skip = skip;

  next();
};

module.exports = validateSortAndPageParams;