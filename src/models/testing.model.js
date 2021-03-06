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
    history: [
      { startDate: { type: Number } }
    ],
    score: {
      type: Number
    },
    time: {
      type: Number,
      default: 0
    },
    theta: { type: String },
    se: { type: String },
    startedAt: {
      type: Number,
      default: moment().unix()
    },
    isOldSystem: { type: Boolean },
    finishedAt: {
      type: Number,
      default: null
    },
    updatedAt: {
      type: Number,
      default: moment().unix()
    },
    deletedAt: { type: Number, default: null }
  },
}