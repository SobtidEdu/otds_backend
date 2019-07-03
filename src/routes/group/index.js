'use strict'

const groupList = require('./list')
const groupSearch = require('./search')
const groupCreate = require('./create')
const groupUpdate = require('./update')
const groupDelete = require('./delete')

const studentRequestToJoinGroup = require('./request-join')
const listOfRequestor = require('./list-requestor')

module.exports = async (fastify, options) => {

  fastify.register(groupList)
  fastify.register(groupSearch)
  fastify.register(groupCreate)
  fastify.register(groupUpdate)
  fastify.register(groupDelete)

  fastify.register(listOfRequestor)
  fastify.register(studentRequestToJoinGroup)

  // fastify.register(require('./student'))
  // fastify.register(require('./student'))
}