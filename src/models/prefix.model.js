'use strict'

const moment = require('moment');

module.exports = {
  name: 'prefixs',
  alias: 'Prefix',
  schema: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    visible: {
      teacher: { type: Boolean, default: true },
      student: { type: Boolean, default: true }
    },
    seq: {
      type: Number
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