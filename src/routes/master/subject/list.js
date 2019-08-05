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

    return await fastify.paginate(fastify.mongoose.Subject, query)
  })
    
}
