'use strict'

const moment = require('moment');
const { GENDER, ROLE, USERGROUP_STAUS } = require('@root/config')

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
        info: {
          type: "ObjectId",
          ref: "Group"
        },
        status: {
          type: { type: String, enum: USERGROUP_STAUS },
          name: { type: String }
        },
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