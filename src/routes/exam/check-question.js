'use strict' 

const moemnt = require('moment')
const axios = require('axios')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.post('/check/q/:questionCode', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, params } = request
    const response = await fastify.otimsApi.checkQuestion(params.questionCode)
    console.log(response)
    return response
  })
}