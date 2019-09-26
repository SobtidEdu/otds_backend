'use strict' 

const { ROLE } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')
const moment = require('moment')

module.exports = async function(fastify, opts, next) { 
  const schema = {}
  fastify.patch('/:groupId/students/leave', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request, reply) => {
    const { user, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    await Promise.all([
      fastify.mongoose.Group.updateOne({
        _id: group._id,
        students: { $elemMatch: { userInfo: user._id } }
      }, { 
        $set: { 
          'students.$.status': STUDENT_STATUS.LEFT, 
          'students.$.leftDate': moment().unix() 
        } 
      }),
      fastify.mongoose.User.updateOne({_id: user._id}, { $pull: { groups: { info: group._id } } })
    ])

    return { message: fastify.message('group.left') }
  })
}
