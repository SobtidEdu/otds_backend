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
    school: {
      name: {
        text: { type: String },
        isModified: { type: Boolean },
      },
      addressNo: {
        text: { type: String },
        isModified: { type: Boolean },
      },
      villageNo: {
        text: { type: String },
        isModified: { type: Boolean },
      },
      lane: {
        text: { type: String },
        isModified: { type: Boolean },
      },
      road: {
        text: { type: String },
        isModified: { type: Boolean },
      },
      subDistrict: {
        text: { type: String },
        isModified: { type: Boolean },
      },
      district: {
        text: { type: String },
        isModified: { type: Boolean },
      },
      postalCode: {
        text: { type: String },
        isModified: { type: Boolean },
      },
      department: {
        text: { type: String },
        isModified: { type: Boolean },
      },
      province: {
        id: {
          type: "ObjectId",
          ref: "Province"
        },
        isModified: { type: Boolean }
      },
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
    isSeenModified: {
      type: Boolean,
      default: true
    },
    groups: [
      {
        info: {
          type: "ObjectId",
          ref: "Group"
        },
        status: {
          type: String, 
          enum: Object.values(USERGROUP_STAUS)
        }
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