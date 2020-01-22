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

  fastify.decorate('updateLastActionMyExam', async (user, examId, groupId = null) => {
    if (user) {
      const { myExam } = user
      const foundMyExamIndex = Array.from(myExam).findIndex(me => {
        return me.examId.toString() === examId.toString() && getMongoObject(me.groupId) === getMongoObject(groupId)
      })

      if (foundMyExamIndex > -1) {
        user.myExam[foundMyExamIndex].latestAction = moment().unix()
      } else {
        const newExam = { examId, groupId, latestAction: moment().unix() }
        user.myExam.push(newExam)
      }
      user.save()
    }
      
  })

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