'use strict'

const moment = require('moment');

module.exports = {
  name: 'faqs',
  alias: 'FAQ',
  schema: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    question: { type: String },
    answer: {
      type: String
    },
    visible: [{
      type: String,
      enum: ['guest', 'teacher', 'student']
    }],
    isActive: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Number,
      default: moment().unix()
    },
    updatedAt: {
      type: Number,
      default: moment().unix()
    }
  }
}