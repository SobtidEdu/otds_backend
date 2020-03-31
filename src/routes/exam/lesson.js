'use strict' 

const moemnt = require('moment')
const axios = require('axios')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/lessons', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    const params = {}
    if (query.subject) {
      params.learning_area = query.subject
    }
    if (query.grade) {
      params.key_stage = query.grade
    }
    return await fastify.otimsApi.getLessons(params)
  })
}