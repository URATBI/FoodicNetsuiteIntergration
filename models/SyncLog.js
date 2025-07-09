const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  total: Number,
  status: String,
  error: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SyncLog', syncLogSchema);
