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
  
      const index = group.students.findIndex(student => {
        console.log(student.userInfo.toString())
        console.log(user._id.toString())
        return student.userInfo.toString() == user._id.toString()
      })
      const addUserToGroupProm = index > -1 ?
        fastify.mongoose.Group.updateOne({ 
          _id: group._id,
          'students.userInfo': user._id
        }, {
          $set: { 
            'students.$.requestedDate': moment().unix(), 
            'students.$.status': STUDENT_STATUS.REQUEST,
            'students.$.joinDate': null,
            'students.$.leftDate': null,
            'students.$.teacherSeenLeft': false
          }
        }) : // change status user that have status left
        fastify.mongoose.Group.updateOne({ _id: group._id }, {
          $push: {
            'students' : { userInfo: user._id, status: STUDENT_STATUS.REQUEST, requestedDate: moment().unix() }
          }
        }) // add new user
      
        await Promise.all([
        addUserToGroupProm,
        fastify.mongoose.User.updateOne({ _id: user._id }, { $push: { groups : { info: group._id, status: GROUP_STATUS.REQUEST } } })
      ])
      
      return { message: fastify.message('group.requested_to_join') }
    })
}
