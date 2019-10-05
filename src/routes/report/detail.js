'use strict'

const { ROLE, GROUP_STATUS } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

var mongoose = require('mongoose');

module.exports = async (fastify, options) => {

  fastify.get('/:examId', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request) => {
    const { user, params } = request

    const aggregate = [
      {
        $match: { 
          examId: mongoose.Types.ObjectId(params.examId),
          userId: mongoose.Types.ObjectId(user._id),
          finishedAt: { $ne: null }
        }
      }
    ]
    
    const response = await fastify.mongoose.Testing.aggregate(aggregate)
    // return response
    return response.map(data => ({
      testingId: data._id,
      startedAt: data.startedAt,
      finishedAt: data.finishedAt,
      score: data.score
    }))
  })
}