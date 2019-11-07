'use strict' 
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/start', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ],
  }, async (request) => {
    const { user, body } = request
    const { examId, groupId } = body

    const exam = await fastify.mongoose.Exam.findOne({ _id: examId }).lean()
    if (!exam) throw fastify.httpErrors.notFound('ไม่พบชุดข้อสอบ')
    if (!user && !exam.withoutRegistered) throw fastify.httpErrors.forbidden('ไม่อนุญาตให้เข้าทำข้อสอบชุดนี้')
    if (exam.oneTimeDone && user) {
      const existingTesting = await fastify.mongoose.Testing.findOne({ examId: exam._id, userId: user._id })
      if (existingTesting && existingTesting.finishedAt !== null) {
        throw fastify.httpErrors.forbidden('ไม่อนุญาตให้เข้าทำข้อสอบชุดนี้')
      }
    }

    if (exam.type !== 'CAT') {
      const { questions } = exam

      const testingData = {
        // isStudentTesting: user.role === 'student' ? true : false,
        finishedAt: null,
        examId
      }

      if (user) {
        testingData.userId = user._id
      }

      const finder = testingData

      if (groupId) {
        finder.groupId = groupId
      }

      if (user) {
        const testingExist = await fastify.mongoose.Testing.findOne(finder).lean()
      
        if (testingExist) {
          return { ...testingExist, questions }
        }
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
