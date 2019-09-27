'use strict' 
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.get('/:testingId/solution', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ],
  }, async (request) => {
    const { user, params } = request

    const testing = await fastify.mongoose.Testing.findOne({ _id: params.testingId })
    if (!testing) return fastify.httpErrors.notFound('ไม่พบข้อมูลการทำข้อสอบ')

    const exam = await fastify.mongoose.Exam.findOne({ _id: testing.examId })
    if (!exam) return fastify.httpErrors.notFound('ไม่พบข้อมูลชุดข้อสอบ')

    if (testing.finishedAt === null) return fastify.httpErrors.badRequest('กรุณาส่งข้อสอบก่อน')

    const { questions } = exam

    return { ...testing.toObject(), questions }
  })
}
