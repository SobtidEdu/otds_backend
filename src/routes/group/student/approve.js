'use strict' 
const  moment = require('moment')
const { ROLE, GROUP_STATUS } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.patch('/:groupId/students/approve', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
      ]
    }, async (request) => {
      const { params, body } = request

      const { studentIds } = body

      const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
      if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

      await Promise.all([
        fastify.mongoose.Group.updateOne({
          _id: group._id,
          students: { $elemMatch: { userInfo: { $in: studentIds } } }
        }, { 
          $set: { 
            'students.$[elem].status': STUDENT_STATUS.JOIN, 
            'students.$[elem].jointDate': moment().unix() 
          } 
        }),
        fastify.mongoose.User.updateMany({
          _id: { $in: studentIds },
          groups: { $elemMatch: { info: group._id, status: GROUP_STATUS.REQUEST } }
        }, { 
          $set: { 
            'groups.$.joinAt': moment().unix(), 
            'groups.$.status': GROUP_STATUS.JOIN 
          } 
        })
      ])

      return { message: fastify.message('group.approval') }
    })
}
