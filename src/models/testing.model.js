'use strict'

const moment = require('moment');
const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = {
  name: 'testings',
  alias: 'Testing',
  schema: {
    examId: {
      type: "ObjectId",
      ref: "Exam"
    },
    userId: {
      type: "ObjectId",
      ref: "User"
    },
    progressTestings: [
      {
        questionId: { type: String },
        answer: Schema.Types.Mixed,
        order: { type: Number },
        note: {
          text: { type: String },
          file: { type: String },
        }
      }
    ],
    timeLeft: { type: Number }
  },
}