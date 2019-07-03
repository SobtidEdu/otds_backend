'use strict'

const groupList = require('./list')
const groupSearch = require('./search')
const groupCreate = require('./create')
const groupUpdate = require('./update')
const groupDelete = require('./delete')

const listOfRequestor = require('./student/list-requestor')
const listOfStudent = require('./student/list-student')
const studentRequestToJoinGroup = require('./student/request-join')
const studentCancelToJoinGroup = require('./student/cancel')
const approveStudentToJoinGroup = require('./student/approve')
const studentLeaveGroup = require('./student/leave')


module.exports = async (fastify, options) => {

  fastify.register(groupList)
  fastify.register(groupSearch)
  fastify.register(groupCreate)
  fastify.register(groupUpdate)
  fastify.register(groupDelete)

  // STUDENT ZONE //
  fastify.register(listOfRequestor)
  fastify.register(listOfStudent)
  fastify.register(studentRequestToJoinGroup)
  fastify.register(studentCancelToJoinGroup)
  
  fastify.register(approveStudentToJoinGroup)
  fastify.register(studentLeaveGroup)
}