module.exports = {
  name: 'schools',
  alias: 'School',
  schema: {
    name: {
      type: String,
      unique: true
    },
    addressNo: {
      type: String,
    },
    villageNo: {
      type: String,
    },
    lane: {
      type: String,
    },
    road: {
      type: String,
    },
    subDistrict: {
      type: String,
    },
    district: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: new Date
    },
    updatedAt: {
      type: Date,
      default: new Date
    }
  },
}