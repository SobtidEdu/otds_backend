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
    questionQuantity: { type: Number },
    lassons: [
      {
        name: { type: String },
        quantity: { type: Number },
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
    haveHowTo: { type: Boolean },
    haveSolution: { type: Boolean },
    oneTimeDone: { type: Boolean },
    createdAt: {
      type: Number,
      default: moment().unix()
    }
  },
}