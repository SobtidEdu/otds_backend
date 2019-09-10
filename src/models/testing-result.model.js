'use strict'

const moment = require('moment');
const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = {
  name: 'testingResults',
  alias: 'TestingResult',
  schema: {
    examId: {
      type: "ObjectId",
      ref: "Exam"
    },
    userId: {
      type: "ObjectId",
      ref: "User"
    },
    results: [
      {
        questionId: { type: String },
        answer: Schema.Types.Mixed,
        order: { type: Number },
        isCorrect: { type: Boolean }
      }
    ],
    totalScore: { type: Number },
    timeUsing: { type: Number },
    createdAt: { type: Number, default: moment().unix() }
  },
}