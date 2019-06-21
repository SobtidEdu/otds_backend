'use strict'

const mongoose = require('mongoose');
const moment = require('moment');
const generator = require('rand-token').generator({ chars: '0-9' })


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
    students: {
      requestToJoin: [
        {
          userInfo: {
            type: "ObjectId",
            ref: "User"
          },
          requestedDate: {
            type: Number,
            default: moment().unix()
          }
        }
      ],
      inGroup: [
        {
          userInfo: {
            type: "ObjectId",
            ref: "User"
          },
          jointDate: {
            type: Number,
            default: moment().unix()
          }
        }
      ],
      hasLeft: [
        {
          userInfo: {
            type: "ObjectId",
            ref: "User"
          },
          leftDate: {
            type: Number,
            default: moment().unix()
          }
        }
      ]
    },
    // exams: [
    //   {
    //     type: "ObjectId",
    //     ref: "Exam"
    //   }
    // ],
    code: {
      type: String,
      default: () => generator.generate(4)
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