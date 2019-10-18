'use strict' 

const { ROLE } = require('@config/user')
const bcrypt = require('bcrypt')
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.patch('/seen-notice', {
    preValidation: [
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user } = request
    
  })
}