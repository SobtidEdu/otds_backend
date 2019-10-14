'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.patch('/:departmentId', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN]),
    ]
  },
  async (request) => {
    const { params, body } = request

    await fastify.mongoose.Department.updateOne({ _id: params.departmentId }, body)

    return department
  })
}