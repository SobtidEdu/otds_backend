'use strict'

const moment = require('moment');
const generator = require('rand-token').generator({ chars: '0-9' })

module.exports = {
  name: 'exams',
  alias: 'Exam',
  schema: {
    examset: {
      type: "ObjectId",
      ref: "ExamSet"
    },
    testSetId: { type: String },
    questions: [
      {
        seq: { type: Number },
        id: { type: String },
        type: { type: String },
        text: { type: String },
        suggestedTime: { type: Number },
        explanation: { type: String }
      }
    ],
    createdAt: {
      type: Number,
      default: moment().unix()
    }
  },
}