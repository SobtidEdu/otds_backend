'use strict' 

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/:testingId/finish', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ],
  }, async (request) => {
    const { user, body, params } = request
    const { questionId, order, answer } = body

    

    return { message: 'Sent answers' }
  })
}
