'use strict' 
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/start', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ],
  }, async (request) => {
    const { user, body } = request
    const { examId, groupId } = body

    const exam = await fastify.mongoose.Exam.findOne({ _id: examId }).lean()
    if (!exam) return fastify.httpErrors.notFound()

    if (exam.type !== 'CAT') {
      const { questions } = exam

      const testingData = {
        userId: user._id, 
        // isStudentTesting: user.role === 'student' ? true : false,
        finishedAt: null,
        examId
      }

      const finder = testingData

      if (groupId) {
        finder.groupId = groupId
      }

      const testingExist = await fastify.mongoose.Testing.findOne(finder).lean()
      
      if (testingExist) {
        return { ...testingExist, questions }
      }

      const testing = await fastify.mongoose.Testing.create(Object.assign(testingData, { startedAt: moment().unix() }))

      return { ...testing.toObject(), questions }

    } else {
      const params = {
        // TestSetID: exam.subject
        KeyStage: exam.grade,
        LearningArea: exam.subject,
        // TotalTime: กำหนดเวลาในการทำ (optional)
        NoItems: exam.examSetTotal,
        FollowStrand: "false",
        BankType: exam.bankType,
      }

      return await fastify.otimsApi.requestFirstItemCAT(params)
    }
  })
}
