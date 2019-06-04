'use strict'

const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = {
  name: 'groups',
  alias: 'Group',
  schema: {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    students: {
      requestToJoin: [
        {
          type: "ObjectId",
          ref: "User"
        }
      ],
      InGroup: [
        {
          type: "ObjectId",
          ref: "User"
        }
      ]
    },
    exams: [{}],
    profileImage: {
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