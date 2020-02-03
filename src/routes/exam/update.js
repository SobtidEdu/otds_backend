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

    let conditioner = { _id: params.examId }
    if (user.role != ROLE.ADMIN) {
      conditioner.owner = user._id
    }

    await fastify.mongoose.Exam.updateOne(conditioner, data)

    if (body.status == false) {
      await fastify.mongoose.Group.updateMany({ 'exams._id': params.examId }, { $set: { 'exams.$.status': false }})
    }
    
    return { message: 'Exam has been updated' }
  })
}