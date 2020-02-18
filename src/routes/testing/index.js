'use strict'

module.exports = async (fastity, opts) => {

  fastity.decorate('updateLastActionMyExam', async (user, examId, groupId = null) => {
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

  fastity.register(require('./start'))
  fastity.register(require('./solution'))
  fastity.register(require('./answer'))
  fastity.register(require('./mark'))
  fastity.register(require('./finish'))
  fastity.register(require('./result'))
  fastity.register(require('./upload'))
}