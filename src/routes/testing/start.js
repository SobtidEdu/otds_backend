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
      groupId: null,
      finishedAt: null,
      examId,
      userId: user ? user._id : `guest${fastify.utils.randomString()}`
    }

    const finder = testingData

    if (groupId) {
      finder.groupId = groupId
    }

    if (user) {
      const testingExist = await fastify.mongoose.Testing.findOne(finder).lean()

      if (testingExist) {
        await fastify.mongoose.Testing.updateOne({ _id: testingExist._id}, { updatedAt: moment().unix() })
        return { ...testingExist, questions }
      }
    }

    const testing = await fastify.mongoose.Testing.create(Object.assign(testingData, { startedAt: moment().unix() }))

    return { ...testing.toObject(), questions }
  })
}
