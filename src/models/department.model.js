'use strict'

const moment = require('moment');

module.exports = {
  name: 'departments',
  alias: 'Department',
  schema: {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    seq: {
      type: Number
    },
    isActive: {
      type: Boolean,
      default: true
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