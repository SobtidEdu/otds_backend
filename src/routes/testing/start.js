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

    if (!exam) {
      return fastify.httpErrors.notFound()
    }

    const { questions } = exam

    const testingData = {
      userId: user._id, 
      finishedAt: null,
      examId
    }
    if (groupId) {
      finder.groupId = groupId
    }

    const testingExist = await fastify.mongoose.Testing.findOne(testingData).lean()

    if (testingExist) {
      return { ...testingExist, questions }
    }

    const testing = await fastify.mongoose.Testing.create(Object.assign(testingData, { startedAt: moment().unix() }))

    return { ...testing.toObject(), questions }
  })
}
