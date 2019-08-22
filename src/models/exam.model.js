'use strict'

const moment = require('moment');
const generator = require('rand-token').generator({ chars: '0-9' })
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
  name: 'exams',
  alias: 'Exam',
  schema: {
    examset: {
      type: "ObjectId",
      ref: "ExamSet"
    },
    testSetId: { type: String },
    questions: [{
      seq: { type: Number },
      id: { type: String },
      type: { type: String },
      text: { type: String },
      suggestedTime: { type: Number },
      explanation: { type: String },
      answers: Schema.Types.Mixed
    }],
    createdAt: {
      type: Number,
      default: moment().unix()
    }
  },
}