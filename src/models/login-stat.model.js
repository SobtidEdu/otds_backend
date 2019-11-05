'use strict'

const moment = require('moment');

module.exports = {
  name: 'login_stat',
  alias: 'LoginStat',
  schema: {
    day: { type: Number },
    month: { type: Number },
    year: { type: Number },
    users: [{
      _id: {
        type: "ObjectId",
        ref: "User"
      },
      role: { type: String }
    }]
  }
}