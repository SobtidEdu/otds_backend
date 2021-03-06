'use strict' 

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/:testingId/mark', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ],
  }, async (request) => {
    const { user, body, params } = request
    const { questionId, order, type, isMark } = body

    const testing = await fastify.mongoose.Testing.findOne({ _id: params.testingId, userId: user._id })
    
    if (!testing) throw fastify.httpErrors.notFound(`Not found testing id: ${params.testingId}`)

    const { progressTestings } = testing

    const progress = { questionId, order, type, isMark }

    const progressTestingIndex = progressTestings.findIndex(progressTesting => progressTesting.questionId === questionId)
    if (progressTestingIndex > -1) {
      Object.assign(progressTestings[progressTestingIndex], progress)
    } else {
      progressTestings.push({ ...progress, answer: null })
    }

    await fastify.mongoose.Testing.update({ _id: testing._id }, { progressTestings })

    return { message: 'marked' }
  })
}
