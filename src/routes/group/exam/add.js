'use strict' 

const { ROLE } = require('@config/user')
const moment = require('moment')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.put('/:groupId/exams', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
      ]
    }, async (request) => {
      const { params, body } = request;
      
      let { examIds } = body
      const group = await fastify.mongoose.Group.findOne({ _id: params.groupId })

      examIds.forEach(examId => {
        group.exams.push({
          _id: examId,
          status: true,
          addedAt: moment().unix()
        })
      })

      return await group.save()
    })
}
