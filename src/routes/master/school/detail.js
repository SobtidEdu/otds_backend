'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.get('/:schoolId', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ]
  },
  async (request) => {
    const { params } = request

    const school = await fastify.mongoose.School.findOne({ _id: params.schoolId })

    return school
  })
}