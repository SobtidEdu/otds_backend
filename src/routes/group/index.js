'use strict'

const groupList = require('./list')
const groupDetail = require('./detail')
const groupSearch = require('./search')
const groupCreate = require('./create')
const groupUpdate = require('./update')
const groupDelete = require('./delete')

const studentRequestToJoinGroup = require('./student/request-join')
const studentCancelToJoinGroup = require('./student/cancel')
const approveStudentToJoinGroup = require('./student/approve')
const rejectStudentToJoinGroup = require('./student/reject')
const studentLeaveGroup = require('./student/leave')
const removeStudentFormGroup = require('./student/remove')

const listOfExam = require('./exam/list')

module.exports = async (fastify, options) => {

  fastify.register(groupList)
  fastify.register(require('./left'))
  fastify.register(groupSearch)
  fastify.register(groupDetail)
  fastify.register(groupCreate)
  fastify.register(groupUpdate)
  fastify.register(groupDelete)

  // STUDENT ZONE //
  fastify.register(require('./student/list'))
  fastify.register(studentRequestToJoinGroup)
  fastify.register(studentCancelToJoinGroup)
  fastify.register(approveStudentToJoinGroup)
  fastify.register(rejectStudentToJoinGroup)
  fastify.register(studentLeaveGroup)
  fastify.register(removeStudentFormGroup)
  fastify.register(require('./student/dismiss'))

  // EXAM ZONE //
  fastify.register(listOfExam)
  fastify.register(require('./exam/add'))
  fastify.register(require('./exam/remove'))
  fastify.register(require('./exam/update'))
}