'use strict' 

const { ROLE } = require('@config/user')
const { CRITERION, EXAM_TYPE, LEVEL } = require('@config/exam')
const moment = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/:examId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ]
  }, async (request) => {
    
    const { params, query, user } = request
    let testing = {}
    try {
      let exam = {}
      
      if (query.searchType && query.searchType === 'code') {
        exam = await fastify.mongoose.Exam.findOne({ code: params.examId }).select(query.includeQuestion ? '' : '-questions').lean()
        if (!exam) {
          throw fastify.httpErrors.notFound(`Not found exam id ${params.examId}`)
        }
      } else {
        exam = await fastify.mongoose.Exam.findOne({ _id: params.examId }).select(query.includeQuestion ? '' : '-questions').lean()
        if (!exam) {
          throw fastify.httpErrors.notFound(`ไม่พบชุดข้อสอบ`)
        }
        exam.owner = await fastify.mongoose.User.findOne({ _id: exam.owner }).select('_id firstName lastName prefixName, role')

        exam.isContinueTesting = await fastify.mongoose.Testing.count({ examId: exam._id, finishedAt: null })
      }

      if (user) {
        const queryTesting = { examId: exam._id, userId: user._id, groupId: { $exists: false }, }
        if (query.groupId) {
          queryTesting.groupId = query.groupId
        }
        testing = await fastify.mongoose.Testing.find(queryTesting).sort({ finishedAt: 1 }).limit(1)
      }
      

      return { ...exam, testing }
    } catch (e) {
      console.log(e)
      if (e.kind === 'ObjectId') throw fastify.httpErrors.notFound(`Not found exam id ${params.examId}`)
      throw fastify.httpErrors.internalServerError(`Something went wrong`)
    }
  })
}