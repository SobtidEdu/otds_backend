'use strict' 

const { ROLE } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')
const moment = require('moment')

module.exports = async (fastify, opts, next) => { 
  const schema = {}

  fastify.patch('/:groupId/students/dismiss', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
    ]
  }, async (request) => {
    const { user, params, body } = request

    const { studentIds } = body

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId })
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    const { students } = group
      
    const studentUpdate = students.map(student => {
      if (studentIds.includes(student.userInfo.toString())) {
        student.status = STUDENT_STATUS.DISMISS
        student.leftDate = moment().unix()
      }
      return student
    })

    await fastify.mongoose.Group.updateOne({
      _id: group._id,
      students: {
        $elemMatch: { userInfo: { $in: studentIds } }
      }
    }, {
      $set: { 
        students: studentUpdate
      } 
    })
    
    return { message: fastify.message('group.remove') }
  })
}
