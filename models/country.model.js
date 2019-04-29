'use strict'

const mongoose = require('mongoose');
const moment = require('moment');

module.exports = {
  name: 'countries',
  alias: 'Country',
  schema: {
    name: {
      th: {
        type: String,
        required: true,
        trim: true
      },
      en: {
        type: String,
        required: true,
        trim: true
      }
    },
    abbr: {
      type: String,
      required: true,
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