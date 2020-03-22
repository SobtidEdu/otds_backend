'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.get('/share/fb', {
    preValidation: [
      (request) => fastify.validate(schema, request),
    ]
  }, async (request, reply) => {
    const { query } = request
    
    const html = await fastify.htmlTemplate.bindFacebookSharePahe(query)
    return reply.type('text/html').send(html)
  })
}