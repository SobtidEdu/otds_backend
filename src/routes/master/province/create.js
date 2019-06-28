'use strict'
const { ROLE } = require('@config/user')
module.exports = async (fastify, options) => {
  const schema = {}

  fastify.post('/', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  },
  async (request) => {
    const province = await fastify.mongoose.Province.create(request.body)
    return reply.status(201).send(province)
  })
}