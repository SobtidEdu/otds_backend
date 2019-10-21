'use strict' 
const mongoose = require('mongoose')
const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => {
  fastify.post('/:examId/suggestion', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN])
    ]
  }, async (request) => {
    const { params } = request
    
    const exam = await fastify.mongoose.Exam.findOne({ _id: params.examId })
    if (!exam) throw fastify.httpErrors.badRequest('Not found exam id')

    let examSuggestion = await fastify.mongoose.ExamSuggestion.findOne({})

    if (!examSuggestion) {
      examSuggestion = new fastify.mongoose.ExamSuggestion()
    }

    examSuggestion.list.push({ exam: exam._id })

    await examSuggestion.save()

    return { message: 'Has been add suggestion' }
  })
}