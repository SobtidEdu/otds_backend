'use strict' 

const { ROLE } = require('@config/user')
const { CRITERION, EXAM_TYPE, LEVEL } = require('@config/exam')
const moment = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/:examId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    
    const { user, params } = request

    try {
      const exam = await fastify.mongoose.Exam.findOne({ _id: params.examId }).select('-questions')
      return exam
    } catch (e) {
      if (e.kind === 'ObjectId') throw fastify.httpErrors.notFound(`Not found exam id ${params.examId}`)
    }

  })
}