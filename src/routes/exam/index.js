'use strict' 

const examList = require('./list')
const examCreate = require('./create')

module.exports = async (fastify) => { 
  fastify.register(examList)
  fastify.register(examCreate)
}