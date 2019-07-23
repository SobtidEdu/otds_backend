'use strict' 

const { ROLE } = require('@config/user')

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

      const { requestToJoin, inGroup } = group.students

      if (inGroup.filter(student => studentIds.includes(student.userInfo.toString())).length > 0) {
        throw fastify.httpErrors.badRequest('มีจำนวนนักเรียนอย่างน้อย 1 คนอยู่ในกลุ่มแล้ว')
      }

      studentIds.forEach(studentId => {
        if (requestToJoin.findIndex(student => student.userInfo == studentId) == -1) {
          throw fastify.httpErrors.badRequest('มีจำนวนนักเรียนอย่างน้อย 1 คนยังไม่ได้ทำการขอเข้าร่วม')
        }
      })

      await Promise.all([
        fastify.mongoose.Group.updateOne({_id: group._id}, { $pull: { 'students.requestToJoin' : { userInfo: { $in: studentIds } } } }),
        fastify.mongoose.User.updateMany({ _id: { $in: studentIds } }, { $pull: { groups : { info: group._id } } })
      ])

      return { message: fastify.message('group.rejected') }
  })
}
