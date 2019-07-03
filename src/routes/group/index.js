'use strict'

const groupList = require('./list')
const groupSearch = require('./search')
const groupCreate = require('./create')
const groupUpdate = require('./update')
const groupDelete = require('./delete')

const listOfRequestor = require('./list-requestor')
const studentRequestToJoinGroup = require('./request-join')
const approveStudentToJoinGroup = require('./approve')
const studentCancelRequestToJoinGroup = require('./cancel')


module.exports = async (fastify, options) => {

  fastify.register(groupList)
  fastify.register(groupSearch)
  fastify.register(groupCreate)
  fastify.register(groupUpdate)
  fastify.register(groupDelete)

  fastify.register(listOfRequestor)
  fastify.register(studentRequestToJoinGroup)
  fastify.register(studentCancelRequestToJoinGroup)
  fastify.register(approveStudentToJoinGroup)

  // fastify.register(require('./student'))
  // fastify.register(require('./student'))
}