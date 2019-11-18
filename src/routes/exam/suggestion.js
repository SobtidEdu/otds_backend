'use strict' 
const mongoose = require('mongoose')
const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => {
  fastify.get('/suggestions', {
    preValidation: [
      fastify.authenticate({ allowGuest: true })
    ]
  }, async (request) => {
    const { user } = request

    const suggestionExam = await fastify.mongoose.ExamSuggestion.findOne({}).lean()

    if (!suggestionExam) return []
    
    const { list } = suggestionExam

    if (!list || list.length == 0) return []
    
    let baseAggregate = [{
      $match: {
        _id: { $in: list.map(e => e.exam ) },
      }
    }]

    if (user && user.role == ROLE.ADMIN) {
      baseAggregate = baseAggregate.concat([
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        {
          $unwind: '$owner'
        },
        {
          $lookup: {
            from: 'testings',
            localField: '_id',
            foreignField: 'examId',
            as: 'testings'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            subject: 1,
            code: 1,
            type: 1,
            status: 1,
            createdAt: 1,
            owner: {
              role: 1,
              name: { $concat: ['$owner.firstName', ' ', '$owner.lastName'] }
            },
            countTestings: { $size: '$testings' },
            latestTesting: { $max: '$testings.finishedAt'}
          }
        }
      ])
    } else {
      baseAggregate = baseAggregate.concat([
        {
          $match: {
            status: true
          }
        },
        {
          $project: {
            _id: 1,
            code: 1,
            subject: 1,
            competition: 1,
            name: 1,
            description: 1,
            quantity: 1,
            duration: 1,
            type: 1,
            withoutRegistered: 1
          }
        }
      ])
    }

    const exams = await fastify.mongoose.Exam.aggregate(baseAggregate)

    return list.map(examSuggestion => exams.find(exam => exam._id.toString() == examSuggestion.exam)).filter(exam => exam != null)
  })

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
      examSuggestion = new fastify.mongoose.ExamSuggestion({ list: [] })
    }

    examSuggestion.list.push({ exam: exam._id })

    await examSuggestion.save()

    return { message: 'Has been add suggestion' }
  })

  fastify.delete('/:examId/suggestion', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params } = request
    
    const exam = await fastify.mongoose.Exam.findOne({ _id: params.examId })
    if (!exam) throw fastify.httpErrors.badRequest('Not found exam id')

    await fastify.mongoose.ExamSuggestion.updateOne({}, { $pull: {  list: { exam: exam._id } } })

    return { message: 'Has been remove suggestion' }
  })

  fastify.patch('/:examId/suggestion/seq', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params, body } = request
    
    const examSuggestion = await fastify.mongoose.ExamSuggestion.findOne({}).lean()
    const { list } = examSuggestion

    let indexExamSuggestion = list.findIndex(p => p.exam.toString() === params.examId)

    if (indexExamSuggestion == -1) throw fastify.httpErrors.badRequest('Invalid exam id')
    
    const moveExamSuggestion = list[indexExamSuggestion]

    list.splice(indexExamSuggestion, 1)
    
    list.splice(body.seq, 0, moveExamSuggestion)
    

    await fastify.mongoose.ExamSuggestion.updateOne({ _id: examSuggestion._id }, { list })
    return { message: 'แก้ไขลำดับข้อมูลข้อสอบแนะนำสำเร็จ' }
  })
}