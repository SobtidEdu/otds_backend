'use strict'

const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = {
  name: 'prefixs',
  alias: 'Prefix',
  schema: {
    text: {
      type: String,
      required: true,
      trim: true,
      unique: true
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