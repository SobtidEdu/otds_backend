'use strict' 

const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.get('/:testingId/result', {
    preValidation:fastify.authenticate({ allowGuest: true }),
  }, async (request) => {
    let  { params } = request

    const testing = await fastify.mongoose.Testing.findOne({ _id: params.testingId })
    if (!testing) throw fastify.httpErrors.notFound(`Not found testing id: ${testingId}`)

    let testingTime =  testing.time / 1000
    let score = testing.progressTestings.reduce((total, progressTesting) => total + (progressTesting.isCorrect ? 1 : 0), 0)

    const { userId, examId, groupId, startedAt, finishedAt, theta } = testing
    let listTestings = await fastify.mongoose.Testing.find({ examId, userId, groupId, finishedAt: { $ne: null } }).sort({ finishedAt: 'asc' }).lean()
    const indexTesting = listTestings.findIndex(testing => testing._id.toString() === params.testingId)
    listTestings = listTestings.slice(0, indexTesting + 1)
    let newScores = listTestings.map(testing => testing.score)
    let oldScores = newScores.map(x => x)
    if (listTestings.length > 1) {
      oldScores.pop()
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