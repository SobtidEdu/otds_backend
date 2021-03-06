'use strict'

const moment = require('moment');

module.exports = {
  name: 'schools',
  alias: 'School',
  schema: {
    name: { type: String },
    addressNo: { type: String },
    villageNo: { type: String },
    lane: { type: String },
    road: { type: String },
    subDistrict: { type: String },
    district: { type: String },
    postalCode: { type: String },
    department: { type: String },
    province: {
      type: "ObjectId",
      ref: "Province"
    },
    remark: { type: String },
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