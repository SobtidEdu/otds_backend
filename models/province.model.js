'use strict'

const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = {
  name: 'provinces',
  alias: 'Province',
  schema: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    isActived: {
      type: Boolean,
      default: true
    },
    countryId: {
      type: ObjectId,
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