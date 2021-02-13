const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  indexId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Index',
  },
  moduleCode: String,
  indexNumber: String,
  type: { type: String },
  group: String,
  day: {
    type: String,
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  },
  timeStart: { type: String, match: /\d{4}/ },
  timeEnd: { type: String, match: /\d{4}/ },
  venue: String,
  remark: String,
});

module.exports = classSchema;
