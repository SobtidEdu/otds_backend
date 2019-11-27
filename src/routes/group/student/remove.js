'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts, next) => { 
  const schema = {}

  fastify.patch('/:groupId/students/remove', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
    ]
  }, async (request) => {
    const { user, params, body } = request

    const { studentIds } = body

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId })
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    if (user.role === ROLE.STUDENT) {
      await Promise.all([
        fastify.mongoose.Group.updateOne({_id: group._id}, { $pull: { 'students.userInfo' : user._id } }),
        fastify.mongoose.User.updateOne({ _id: user._id }, { $pull: { groups : { info: group._id } } })
      ])
    } else {
      await Promise.all([
        fastify.mongoose.Group.updateOne({_id: group._id}, { $pull: { 'students' : { userInfo: { $in: studentIds } } } }),
        fastify.mongoose.User.updateMany({ _id: { $in: studentIds } }, { $pull: { groups : { info: group._id } } })
      ])
    }
    
    return { message: fastify.message('group.remove') }
  })
}
