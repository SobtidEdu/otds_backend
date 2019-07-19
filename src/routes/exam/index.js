'use strict' 

// const examList = require('examList')
const examCreate = require('./create')

module.exports = async (fastify) => { 
  fastify.register(examCreate)
}
