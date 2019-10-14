'use strict'
const { ROLE } = require('@config/user')
module.exports = async (fastify, options) => {
  const schema = {}

  fastify.delete('/:provinceId', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  },
  async (request) => {
    const { params } = request
    await fastify.mongoose.Province.deleteOne({ _id: params.provinceId })
    return { message: 'Province has been removed' }
  })
}