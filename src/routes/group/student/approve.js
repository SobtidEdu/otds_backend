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

      const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students').lean()
      if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))
      
      const { students } = group
      
      const studentUpdate = students.map(student => {
        if (studentIds.includes(student.userInfo.toString())) {
          student.status = 'join'
          student.jointDate = moment().unix()
        }
        return student
      })
      
      await Promise.all([
        fastify.mongoose.Group.updateOne({
          _id: group._id
        }, { 
          $set: { 
            students: studentUpdate
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
