'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.delete('/:schoolId', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN]),
    ]
  },
  async (request) => {
    const { params } = request

    fastify.mongoose.School.deleteOne({ _id: params.schoolId })

    return { message: 'School has benn removed' }
  })
}