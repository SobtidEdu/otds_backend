'use strict'

const moment = require('moment');
const generator = require('rand-token').generator({ chars: '0-9' })
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
  name: 'exams',
  alias: 'Exam',
  schema: {
    owner: {
      type: "ObjectId",
      ref: "User"
    },
    oldSystemCode: { type: String },
    code: { type: String },
    subject: { type: String },
    grade: { type: String },
    level: [{ type: String }],
    type: { type: String },
    bankType: { 
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public'
    },
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
    testItems: { type: Array },
    duration: { type: Number },
    name: { type: String },
    description: { type: String },
    displayHowTo: { type: Boolean },
    displaySolution: { type: Boolean },
    oneTimeDone: { type: Boolean },
    isSuggestion: { type: Boolean },
    withoutRegistered: { type: Boolean },
    status: { type: Boolean, default: true },
    competition: {
      project: { type: String },
      years: { type: Array }
    },
    createdAt: {
      type: Number,
      default: moment().unix()
    },
    deletedAt: { type: Number, default: null },
    questions: [{
      seq: { type: Number },
      id: { type: String },
      type: { type: String },
      text: { type: String },
      suggestedTime: { type: Number },
      explanation: { type: String },
      unit: { type: String },
      lessonId: { type: Number },
      answers: Schema.Types.Mixed,
      subQuestions: Schema.Types.Mixed
    }],
  },
}