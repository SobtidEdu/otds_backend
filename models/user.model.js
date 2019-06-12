'use strict'

const moment = require('moment');
const { GENDER, ROLE } = require('../config')

module.exports = {
  name: 'users',
  alias: 'User',
  schema: {
    prefixName: {
      type: String,
      required: true,
      trim: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      required: true,
      enum: Object.values(GENDER)
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      hashed: {
        type: String,
      },
      algo: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.STUDENT
    },
    department: {
      type: String,
    },
    school: {
      type: { type: String, enum: ['system', 'other'] },
      name: { type: String }
    },
    province: {
      type: "ObjectId",
      ref: "Province"
    },
    profileImage: {
      type: String
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    isLoggedOut: {
      type: Boolean,
      default: true
    },
    isConfirmationEmail: {
      type: Boolean,
      default: false
    },
    groups: [
      {
        type: "ObjectId",
        ref: "Group"
      }
    ],
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