'use strict'

const moment = require('moment');

module.exports = {
  name: 'subjects',
  alias: 'Subject',
  schema: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    isActive: { type: Boolean }
  },
}