'use strict' 

const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.get('/:testingId/result', {
    preValidation:fastify.authenticate({ allowGuest: true }),
  }, async (request) => {
    let  { params } = request

    const testing = await fastify.mongoose.Testing.findOne({ _id: params.testingId })
    if (!testing) throw fastify.httpErrors.notFound(`Not found testing id: ${testingId}`)

    let testingTime =  testing.finishedAt - testing.startedAt
    let score = testing.progressTestings.reduce((total, progressTesting) => total + (progressTesting.isCorrect ? 1 : 0), 0)

    const { userId, examId, startedAt, finishedAt, theta } = testing
    let listTestings = await fastify.mongoose.Testing.find({ examId, userId, finishedAt: { $ne: null } }).sort({ finishedAt: 'desc' }).lean()
    let newScores = listTestings.map(testing => testing.progressTestings.reduce((total, progressTesting) => total + (progressTesting.isCorrect ? 1 : 0), 0))
    let oldScores = newScores
    if (listTestings.length > 1) {
      listTestings.pop()
      oldScores = listTestings.map(testing => testing.progressTestings.reduce((total, progressTesting) => total + (progressTesting.isCorrect ? 1 : 0), 0))
    }

    return {
      score,
      testingTime,
      newAvg: newScores.reduce((total, score) => total + score, 0) / newScores.length,
      oldAvg: oldScores.reduce((total, score) => total + score, 0) / oldScores.length,
      time: listTestings.length,
      startedAt,
      finishedAt,
      theta
    }
  })
}