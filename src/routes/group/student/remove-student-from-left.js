'use strict' 

const { ROLE } = require('@config/user')

module.exports = async function(fastify, opts) { 
  const schema = {}
  fastify.patch('/:groupId/students/remove-left', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { user, params, body } = request

    const { studentIds } = body
    
    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    await fastify.mongoose.Group.updateOne({_id: group._id}, { $pull: { 'students' : { userInfo: { $in: studentIds } } } })

    return { message: 'remove student from group' }
  })
}
