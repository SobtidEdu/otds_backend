'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.patch('/:schoolId', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN]),
    ]
  },
  async (request) => {
    const { params, body } = request

    fastify.mongoose.School.updateOne({ _id: params.schoolId }, { ...body })

    return { message: 'School has benn updated' }
  })
}