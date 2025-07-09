const getStatus = (req, res) => {
  res.json({ status: 'ok', lastSync: new Date().toISOString() });
};

module.exports = { getStatus };