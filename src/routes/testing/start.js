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

    const { questions } = exam

    const testingData = {
      userId: user ? user._id : null,
      groupId: groupId || null,
      examId,
      finishedAt: null
    }

    const finder = testingData

    if (user) {
      const testingExist = await fastify.mongoose.Testing.findOne(finder)
      fastify.updateLastActionMyExam(user, examId, groupId)

      if (testingExist) {
        testingExist.updatedAt = moment().unix()
        testingExist.history.push({ startDate: moment().unix() })
        await testingExist.save()
        return { ...testingExist.toObject(), questions }
      }
    }

    const testing = await fastify.mongoose.Testing.create(Object.assign(testingData, { startedAt: moment().unix(), history: [{ startDate: moment().unix() }] }))

    return { ...testing.toObject(), questions }
  })
}
