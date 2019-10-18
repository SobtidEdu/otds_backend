'use strict' 

const examList = require('./list')
const examDetail = require('./detail')
const examCreate = require('./create')
const examDelete = require('./delete')
const examUpdate = require('./update')
const examLesson = require('./lesson')
const examIndicator = require('./indicator')
const examCompetition = require('./competition')

module.exports = async (fastify) => { 
  fastify.register(examList)
  fastify.register(require('./suggestion'))
  fastify.register(examCreate)
  fastify.register(examLesson)
  fastify.register(examIndicator)
  fastify.register(examCompetition)
  fastify.register(examDelete)
  fastify.register(examUpdate)
  fastify.register(require('./check-question'))
  fastify.register(examDetail)
}