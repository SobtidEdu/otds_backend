'use strict'

const moment = require('moment');


module.exports = {
  name: 'groups',
  alias: 'Group',
  schema: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: "ObjectId",
      ref: "User"
    },
    students: [
      {
        userInfo: {
          type: "ObjectId",
          ref: "User"
        },
        status: {
          type: String,
          
        },
        requestedDate: {
          type: Number,
          default: moment().unix()
        },
        jointDate: {
          type: Number,
          default: moment().unix()
        },
        leftDate: {
          type: Number,
          default: moment().unix()
        }
      }
    ],
    exams: [
      {
        status: {
          type: Boolean,
          default: true
        },
        addedAt: {
          type: Number,
          default: moment().unix()
        }
      }
    ],
    code: {
      type: String
    },
    logo: {
      type: String
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