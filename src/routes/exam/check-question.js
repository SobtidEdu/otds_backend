'use strict' 

const moemnt = require('moment')
const axios = require('axios')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/checking', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    return { message: 'Not implement yet'}
  })
}