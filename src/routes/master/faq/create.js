'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request) => {
    const { body } = request
    return await fastify.mongoose.FAQ.create(body)
  })
}