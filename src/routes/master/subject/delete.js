'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.delete('/:subjectId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params } = request

    return await fastify.mongoose.ExamConfiguration.update({ type: 'SUBJECT' }, { $pull: { data: { id: isNaN(params.subjectId) ? params.subjectId : parseInt(params.subjectId) } } })
  })
    
}
