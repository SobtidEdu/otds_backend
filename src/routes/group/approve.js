'use strict' 

const { ROLE, GROUP_STAUS } = require('@config/user')

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

      const { requestToJoin, inGroup } = group.students

      if (inGroup.filter(student => studentIds.includes(student.userInfo.toString())).length > 0) {
        throw fastify.httpErrors.badRequest('มีจำนวนนักเรียนอย่างน้อย 1 คนอยู่ในระบบแล้ว')
      }

      studentIds.forEach(studentId => {
        if (requestToJoin.findIndex(student => student.userInfo == studentId) == -1) {
          throw fastify.httpErrors.badRequest('มีจำนวนนักเรียนอย่างน้อย 1 คนยังไม่ได้ทำการขอเข้าร่วม')
        }
      })
      
      const requestors = studentIds.map(student => ({ userInfo: student }))

      await Promise.all([
        fastify.mongoose.Group.updateMany({_id: group._id}, { $pull: { 'students.requestToJoin': { $in: { requestors } } } }),
        fastify.mongoose.Group.updateMany({_id: group._id}, { $push: { 'students.inGroup': requestors } }),
        fastify.mongoose.User.updateMany({ _id: { $in: studentIds }, 'groups.status': GROUP_STAUS.REQUEST }, { $set: { 'groups.$.status': GROUP_STAUS.JOIN } } )
      ])

      return { message: fastify.message('group.approval') }
    })
}
