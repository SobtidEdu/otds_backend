'use strict' 

const mongoose = require('mongoose')
const moment = require('moment')

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

    const exam = await fastify.mongoose.Exam.findOne({ _id: testing.examId })

    const { progressTestings } = testing

    const progress = { questionId, order, type, answer, note }

    if (exam.type == 'CAT') {
      const question = exam.questions[order-1]
      const params = {
        TestSetID: exam.code,
        ItemSeq: order,
        ItemID: question.id,
        ItemSelectedChoice: answer,
        ItemResult: question.answers.find(a => a.seq == answer).key ? 1 : 0,
        TimeSpent: 2
      }
      const nextQuestion = await fastify.otimsApi.requestNextItemCAT(params)
      const { type, answers } = transformAnswerCAT(nextQuestion)
      const newQuestion = {
        _id: mongoose.Types.ObjectId(),
        seq: nextQuestion.ItemSeq,
        id: nextQuestion.ItemID,
        answers,
        type,
        text: nextQuestion.ItemQuestion,
        suggestedTime: nextQuestion.SuggestedTime,
        explanation: nextQuestion.Explanation,
      }
      exam.questions.push(newQuestion)
      await exam.save()
      progressTestings.push(progress)
      await fastify.mongoose.Testing.update({ _id: testing._id }, { progressTestings, theta: nextQuestion.Theta, se: nextQuestion.SE, updatedAt: moment().unix() })
      return { newQuestion }
    } else {
      
      const progressTestingIndex = progressTestings.findIndex(progressTesting => progressTesting.questionId === questionId)
      
      if (progressTestingIndex > -1) {
        Object.assign(progressTestings[progressTestingIndex], progress)
      } else {
        progressTestings.push(progress)
      }
      
      await fastify.mongoose.Testing.update({ _id: testing._id }, { progressTestings, updatedAt: moment().unix(), timeLeft: body.timeLeft | null })

      return { message: 'Sent answers' }
    }
  })
}

const transformAnswerCAT = (question) => {
  const { ItemChoiceCAT_ResponseNextItemCAT } = question
  if (ItemChoiceCAT_ResponseNextItemCAT) {
    return { 
      answers: ItemChoiceCAT_ResponseNextItemCAT.ItemChoiceCAT.map(answer => ({
        seq: answer.ItemChoiceSeq,
        text: answer.ItemChoice,
        key: answer.ItemChoiceKey === 'True',
      })),
      type: 'MC'
    }
  }
}