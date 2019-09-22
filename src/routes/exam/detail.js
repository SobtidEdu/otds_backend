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
    
    const { params } = request

    try {
      const exam = await fastify.mongoose.Exam.findOne({ _id: params.examId }).select('-questions').lean()
      exam.owner = await fastify.mongoose.User.findOne({ _id: exam.owner }).select('_id firstName lastName prefixName')
      return exam
    } catch (e) {
      console.log(e)
      if (e.kind === 'ObjectId') throw fastify.httpErrors.notFound(`Not found exam id ${params.examId}`)
      throw fastify.httpErrors.internalServerError(`Something went wrong`)
    }
  })
}