'use strict' 

const moment = require('moment')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/:testingId/finish', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ],
  }, async (request) => {
    const { user, params } = request
    
    const { testingId } = params

    const testing = await fastify.mongoose.Testing.findOne({ _id: testingId })
    if (!testing) throw fastify.httpErrors.notFound(`Not found testing id: ${params.testingId}`)

    const exam = await fastify.mongoose.Exam.findOne({ _id: testing.examId })

    const { questions } = exam

    const finishedAt = moment().unix()

    let { progressTestings } = testing

    progressTestings = questions.map(question => {
      const progressTesting = progressTestings.find(pt => pt.questionId.toString() === question._id.toString())
      if (progressTesting) {
        progressTesting.isCorrect = checkCorrect(question.type, (question.type !== 'TF' ? question.answers : question.subQuestions), progressTesting.answer)
        return progressTesting
      } else {
        return {
          questionId: question._id,
          order: question.seq,
          answer: null,
          isCorrect: false,
          isMark: false
        }
      }
    })

    testing.progressTestings = progressTestings
    testing.finishedAt = finishedAt
    return await testing.save()
  })
}

const checkCorrect = (questionType, originalAnswers, userAnswer) => {
  if (!userAnswer) return false
  switch (questionType) {
    case 'MC':
      const MCAnswer = originalAnswers.find(originalAnswer => originalAnswer.seq == userAnswer)
      return MCAnswer ? MCAnswer.key : false
    case 'SA':
      const SAAnswer = originalAnswers.find(originalAnswer => {
        console.log(originalAnswer)
        originalAnswer.key = originalAnswer.key.replace('<p>', '')
        originalAnswer.key = originalAnswer.key.replace('</p>', '')
        return originalAnswer.key === userAnswer
      })
      return SAAnswer ? true : false
    case 'MA':
      for (let originalAnswer of originalAnswers.left) {
        if (userAnswer.findIndex(ans => ans.seq == originalAnswer.seq && ans.match == originalAnswer.match) === -1)
          return false
      }
      return true
    case 'TF': 
      for (let index in originalAnswers) {
        let optionIndex = originalAnswers[index].answers.findIndex(answer => answer.seq == userAnswer[index].key)
        if (optionIndex === -1 || originalAnswers[index].answers[optionIndex].key === false) {
          return false
        }
      }
      return true
    default : return false
  }
}