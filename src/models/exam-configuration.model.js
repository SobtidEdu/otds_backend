'use strict'

const moment = require('moment');
const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = {
  name: 'exam_configuration',
  alias: 'ExamConfiguration',
  schema: {
    type: {
      type: String,
      required: true,
      trim: true
    },
    data: {
      type: Schema.Types.Mixed
    },
    createdAt: {
      type: Number,
      default: moment().unix()
    },
    updatedAt: {
      type: Number,
      default: moment().unix()
    }
  },
}