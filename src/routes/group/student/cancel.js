'use strict' 

const { ROLE } = require('@config/user')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.patch('/:groupId/students/cancel', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.STUDENT])
      ]
    }, async (request) => {
      const { user, params } = request

      const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
      if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

      await Promise.all([
        fastify.mongoose.Group.updateOne({_id: group._id}, { $pull: { 'students' : { userInfo: user._id } } }),
        fastify.mongoose.User.updateOne({ _id: user._id }, { $pull: { groups : { info: group._id } } })
      ])

      return { message: fastify.message('group.cancelled_request') }
    })
}
