'use strict' 

const { ROLE } = require('@config/user')
const moment = require('moment')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.patch('/:groupId/exams/:examId', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
      ]
    }, async (request) => {
      const { params, user, body } = request;

      const finder = {
        _id: params.groupId,
        'exams._id': params.examId
      }

      if (user.role !== ROLE.ADMIN) {
        finder.owner = user._id
      }

      return await fastify.mongoose.Group.update(finder, { $set: { 'exams.$.status': body.status } })
    })
}
