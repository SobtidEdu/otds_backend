module.exports = {
  name: 'schools',
  alias: 'School',
  schema: {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    province: {
      type: "ObjectId",
      ref: "Province"
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