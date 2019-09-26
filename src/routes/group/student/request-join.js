'use strict' 

const { ROLE, GROUP_STATUS } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')
const moment = require('moment')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.patch('/:groupId/students/request', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.STUDENT])
      ]
    }, async (request) => {
      const { user, params } = request
  
      const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
      if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))
  
      await Promise.all([
        fastify.mongoose.Group.updateOne({ _id: group._id }, { $push: { 'students' : { userInfo: user._id, status: STUDENT_STATUS.REQUEST, requestedDate: moment().unix() } } }),
        fastify.mongoose.User.updateOne({ _id: user._id }, { $push: { groups : { info: group._id, status: GROUP_STATUS.REQUEST } } })
      ])
      
      return { message: fastify.message('group.requested_to_join') }
    })
}
