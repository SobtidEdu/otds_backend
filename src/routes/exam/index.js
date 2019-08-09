'use strict' 

const examList = require('./list')
const examCreate = require('./create')
const examLesson = require('./lesson')
const examIndicator = require('./indicator')

module.exports = async (fastify) => { 
  fastify.register(examList)
  fastify.register(examCreate)
  fastify.register(examLesson)
  fastify.register(examIndicator)
}