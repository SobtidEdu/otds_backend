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
    await fastify.mongoose.Province.create(request.body)
    return { message: 'Province has been created' }
  })
}