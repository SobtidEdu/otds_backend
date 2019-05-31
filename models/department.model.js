'use strict'

const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = mongoose.Schema.Types.ObjectId

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