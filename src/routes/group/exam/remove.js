'use strict' 

const { ROLE } = require('@config/user')
const moment = require('moment')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.delete('/:groupId/exams/:examId', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
      ]
    }, async (request) => {
      const { params, user } = request;
      
      let { groupId, examId } = params
      const group = await fastify.mongoose.Group.findOne({ _id: groupId })

      if (!group) throw fastify.httpErrors.notFound(`Not found group id ${groupId}`)

      await fastify.mongoose.Group.updateOne({_id: group._id}, { $pull: { 'exams' : { _id: examId } } })

      return await group.save()
    })
}
