'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.delete('/:departmentId', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN]),
    ]
  },
  async (request) => {
    const { params } = request

    await fastify.mongoose.Department.deleteOne({ _id: params.departmentId })

    return { message: 'Department has benn removed' }
  })
}