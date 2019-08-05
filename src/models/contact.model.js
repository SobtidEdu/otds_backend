'use strict'

const moment = require('moment');

module.exports = {
  name: 'contact',
  alias: 'Contact',
  schema: {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    email: {
      type: String
    },
    tel: {
      type: String
    },
    address: {
      type: String
    }
  }
}