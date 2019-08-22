'use strict' 

const moemnt = require('moment')
const axios = require('axios')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/competitions', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    return await fastify.otimsApi.getCompetitions()
  })
}