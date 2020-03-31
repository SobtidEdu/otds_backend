'use strict'

const moment = require('moment');

module.exports = {
  name: 'provinces',
  alias: 'Province',
  schema: {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    region: {
      type: String,
      trim: true
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
  },
}