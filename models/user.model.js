'use strict'

const moment = require('moment');

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
      enum: ['student', 'teacher', 'superTeacher', 'admin'],
      default: 'student'
    },
    school: {
      type: {
        type: String,
        enum: ['hasDepartment', 'homeSchool'],
        default: 'hasDepartment'
      },
      id: {
        type: "ObjectId"
      },
      department: {
        type: "ObjectId"
      },
      name: {
        type: String
      },
      address: {
        type: String
      }
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