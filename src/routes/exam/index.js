'use strict' 

const moment = require('moment')

const examList = require('./list')
const examDetail = require('./detail')
const examCreate = require('./create')
const examDelete = require('./delete')
const examUpdate = require('./update')
const examLesson = require('./lesson')
const examIndicator = require('./indicator')
const examCompetition = require('./competition')

const getMongoObject = (attr) => attr ? attr.toString() : null
module.exports = async (fastify) => { 
  
  fastify.register(examList)
  fastify.register(require('./suggestion'))
  fastify.register(require('./group'))
  fastify.register(examCreate)
  fastify.register(examLesson)
  fastify.register(examIndicator)
  fastify.register(require('./strand'))
  fastify.register(examCompetition)
  fastify.register(examDelete)
  fastify.register(examUpdate)
  fastify.register(require('./check-question'))
  fastify.register(examDetail)
}