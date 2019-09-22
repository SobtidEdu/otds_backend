'use strict' 

const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.get('/result', {
    preValidation:fastify.authenticate(),
  }, async (request) => {
    let  { query } = request
    const testingId = query.testingId

    const testing = await fastify.mongoose.Testing.findOne({ _id: testingId })
    if (!testing) throw fastify.httpErrors.notFound(`Not found testing id: ${testingId}`)

    let testingTime =  testing.finishedAt - testing.startedAt
    let score = testing.progressTestings.reduce((total, progressTesting) => total + (progressTesting.isCorrect ? 1 : 0), 0)

    const examId = testing.examId
    const userId = testing.userId
    let listTestings = await fastify.mongoose.Testing.find({ examId: examId , userId: userId })
    listTestings = listTestings.filter(listTesting => listTesting.finishedAt != null)
    console.log(listTestings)
    console.log(listTestings.length)
    return {masseage: "test"}
  })
}