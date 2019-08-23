'use strict' 

const { ROLE } = require('@config/user')
const { CRITERION, EXAM_TYPE, LEVEL } = require('@config/exam')
const moment = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.patch('/:examId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    
    const { user, body, params } = request

    const data = {
      status: body.status
    }

    await fastify.mongoose.ExamSet.updateOne({ _id: params.examId, owner: user._id }, data)
    
    return { message: 'Exam has been updated' }
  })
}