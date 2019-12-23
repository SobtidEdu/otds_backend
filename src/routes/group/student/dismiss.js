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

    await fastify.mongoose.Group.updateMany({
      _id: group._id,
      students: {
        $elemMatch: { userInfo: { $in: studentIds } }
      }
    }, {
      $set: { 
        'students.$[].status': STUDENT_STATUS.DISMISS, 
        'students.$[].leftDate': moment().unix()
      } 
    })
    
    return { message: fastify.message('group.remove') }
  })
}
