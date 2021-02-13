const mongoose = require('mongoose');

const moduleInfoSchema = new mongoose.Schema({
  year: String,
  semester: { type: String, enum: ['1', '2', 'S', 'T'] },
  moduleCode: String,
  moduleName: String,
  moduleNote: { type: String, match: /[\*\^\#]*/ },
  academicUnits: Number,
});

module.exports = moduleInfoSchema;
