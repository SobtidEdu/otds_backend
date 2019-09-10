'use strict' 

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/start', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ],
  }, async (request) => {
    const { user, body } = request
    const { examId } = body

    const exam = await fastify.mongoose.Exam.findOne({ _id: examId }).lean()

    if (!exam) {
      return fastify.httpErrors.notFound()
    }

    const { questions } = exam

    const testingExist = await fastify.mongoose.Testing.findOne({ userId: user._id, examId: examId }).lean()

    if (testingExist) {
      return { ...testingExist, questions }
    }

    const testing = await fastify.mongoose.Testing.create({ userId: user._id, examId })

    return {
      testingId: testing._id,
      progressTestings: [],
      questions
    }
  })
}
