'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.patch('/:faqId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request) => {
    const { params, body } = request
    
    return await fastify.mongoose.FAQ.updateOne({ _id: params.faqId }, body)
  })
}