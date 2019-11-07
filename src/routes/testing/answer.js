'use strict' 

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/:testingId/answer', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ],
  }, async (request) => {
    const { body, params } = request
    const { questionId, order, type, answer, note } = body

    const testing = await fastify.mongoose.Testing.findOne({ _id: params.testingId })
    
    if (!testing) throw fastify.httpErrors.notFound(`Not found testing id: ${params.testingId}`)

    const { progressTestings } = testing

    const progress = { questionId, order, type, answer, note }

    const progressTestingIndex = progressTestings.findIndex(progressTesting => progressTesting.questionId === questionId)
    if (progressTestingIndex > -1) {
      Object.assign(progressTestings[progressTestingIndex], progress)
    } else {
      progressTestings.push(progress)
    }

    await fastify.mongoose.Testing.update({ _id: testing._id }, { progressTestings })

    return { message: 'Sent answers' }
  })
}
