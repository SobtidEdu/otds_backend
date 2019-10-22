'use strict'

const { ROLE } = require('@config/user')

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

    if (group) {
      const response = await Promise.all([
        fastify.mongoose.Group.findOneAndDelete({_id: group._id }),
        fastify.mongoose.User.update({ _id: user._id }, { $pull: { groups: group._id } })
      ]);
    }

    return { message: fastify.message('group.deleted') }
  })
}