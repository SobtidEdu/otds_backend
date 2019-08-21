'use strict'

const moment = require('moment');
const generator = require('rand-token').generator({ chars: '0-9' })

module.exports = {
  name: 'exams',
  alias: 'Exam',
  schema: {
    owner: {
      type: "ObjectId",
      ref: "User"
    },
    subject: { type: String },
    grade: { type: String },
    level: { type: String },
    type: { type: String },
    quantity: { type: Number },
    examSetTotal: { type: Number },
    criterion: { type: String },
    lessons: [
      {
        name: { type: String },
        quantity: { type: Number },
      }
    ],
    indicators: [
      {
        name: { type: String },
        quantity: { type: Number }
      }
    ],
    strands: [
      {
        name: { type: String },
        quantity: { type: Number }
      }
    ],
    duration: { type: Number },
    name: { type: String },
    description: { type: String },
    quantity: { type: Number },
    displayHowTo: { type: Boolean },
    displaySolution: { type: Boolean },
    oneTimeDone: { type: Boolean },
    isSuggestion: { type: Boolean },
    withoutRegistered: { type: Boolean },
    createdAt: {
      type: Number,
      default: moment().unix()
    }
  },
}