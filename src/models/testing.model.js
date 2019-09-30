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
    groupId: {
      type: "ObjectId",
      ref: "Group"
    },
    userId: {
      type: "ObjectId",
      ref: "User"
    },
    progressTestings: [
      {
        questionId: { type: String },
        order: { type: Number },
        answer: Schema.Types.Mixed,
        isCorrect: { type: Boolean },
        isMark: { type: Boolean },
        note: {
          text: { type: String },
          file: { type: String },
        }
      }
    ],
    score: {
      type: Number
    },
    startedAt: {
      type: Number,
      default: moment().unix()
    },
    finishedAt: {
      type: Number,
      default: null
    },
  },
}