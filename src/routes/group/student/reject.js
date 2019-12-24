'use strict' 

const { ROLE } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')
const moment = require('moment')

module.exports = async (fastify, opts, next) => { 
    const schema = {}

    fastify.patch('/:groupId/students/reject', {
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

      const { students } = group
      
      const studentUpdate = students.map(student => {
        if (studentIds.includes(student.userInfo.toString())) {
          student.status = STUDENT_STATUS.REJECT
          student.leftDate = moment().unix()
        }
        return student
      })

      await Promise.all([
        fastify.mongoose.Group.update({
          _id: group._id,
          students: {
            $elemMatch: { userInfo: { $in: studentIds } }
          }
        }, {
          $set: { 
            students: studentUpdate
          }
        })
      ])

      return { message: fastify.message('group.rejected') }
  })
}
