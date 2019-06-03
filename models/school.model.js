module.exports = {
  name: 'schools',
  alias: 'School',
  schema: {
    name: {
      type: String,
      unique: true
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