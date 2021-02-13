const mongoose = require('mongoose');

const indexSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  indexNumber: { type: String, required: true, match: /\d{5}/ },
  updated: { type: Date, default: Date.now() },
});

module.exports = indexSchema;
