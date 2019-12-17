'use strict'

const { ROLE } = require('@config/user')
const moment = require('moment')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.delete('/:id', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ],
  }, async (request, reply) => {
    const { user, params } = request
    
    const group = await fastify.mongoose.Group.findOne({ _id: params.id })

    await fastify.mongoose.Group.update({ _id: group._id }, { deletedAt: moment().unix() })

    return { message: fastify.message('group.deleted') }
  })
}