'use strict'
const { ROLE } = require('@config/user')
module.exports = async (fastify, options) => {
  const schema = {}

  fastify.patch('/:provinceId', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  },
  async (request) => {
    const { params, body } = request
    await fastify.mongoose.Province.updateOne({ _id: params.provinceId }, body)
    return { message: 'Province has been updated' }
  })
}