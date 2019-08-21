'use strict' 

const moemnt = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/indicators', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    const params = {}
    if (query.subject) {
      params.LearningArea = query.subject
    }
    if (query.grade) {
      params.KeyStage = query.grade
    }
    return await fastify.otimsApi.getIndicators(params)
  })
}