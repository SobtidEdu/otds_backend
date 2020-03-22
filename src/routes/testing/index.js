'use strict'

const moment = require('moment')

module.exports = async (fastity, opts) => {

  fastity.decorate('updateLastActionMyExam', async (user, examId, groupId = null) => {
    if (user) {
      const { myExam } = user
      const foundMyExamIndex = Array.from(myExam).findIndex(me => 
        fastity.utils.parseObjectIdToString(me.examId) === fastity.utils.parseObjectIdToString(examId) &&
        fastity.utils.parseObjectIdToString(me.groupId) === fastity.utils.parseObjectIdToString(groupId)
      )

      if (foundMyExamIndex > -1) {
        user.myExam[foundMyExamIndex].latestAction = moment().unix()
      } else {
        const newExam = { examId, groupId, latestAction: moment().unix() }
        user.myExam.push(newExam)
      }
      await user.save()
    }
  })

  fastity.register(require('./start'))
  fastity.register(require('./solution'))
  fastity.register(require('./answer'))
  fastity.register(require('./mark'))
  fastity.register(require('./finish'))
  fastity.register(require('./result'))
  fastity.register(require('./upload'))
  fastity.register(require('./fixed-testing'))
}