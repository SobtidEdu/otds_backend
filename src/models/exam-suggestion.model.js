'use strict'

const moment = require('moment');
const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = {
  name: 'exam_suggestions',
  alias: 'ExamSuggestion',
  schema: {
    list: [
      {
        exam: { type: 'ObjectId', ref: 'Exam' },
        addedAt: { type: Number, default: moment().unix() }
      }
    ],
  },
}