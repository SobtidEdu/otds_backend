'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.get('/', {
    preValidatin: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { query } = request

    const subjects = await fastify.mongoose.ExamConfiguration.findOne({ type: 'SUBJECT' })
    return subjects.data
  })
    
}
