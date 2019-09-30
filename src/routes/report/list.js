'use strict'

const { ROLE, GROUP_STATUS } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

module.exports = async (fastify, options) => {

  fastify.get('/', {
    preValidation: [
      fastify.authenticate()
    ]
  }, async (request) => {

    const { user } = request;

    if (user.role === ROLE.STUDENT) {
      const aggregate = [
        { 
          $match: { 
            $and: [
              { userId: { $eq: user._id } },
              { finishedAt: { $ne: null } }
            ]
          }
        },
        { 
          $group: { 
            _id: "$examId", 
            startedAt: { $last: "$startedAt" },
            latestScore: { $last: "$score" }
          }
        },
        {
          $lookup: {
            from: 'exams',
            localField: '_id',
            foreignField: '_id',
            as: 'exam'
          }
        },
        {
          $unwind: '$exam'
        },
        {
          $project: {
            exam: {
              _id: 1,
              code: 1,
              name: 1,
              subject: 1,
              type: 1
            },
            latestScore: 1,
            startedAt: 1
          }
        }
      ]

      return fastify.mongoose.Testing.aggregate(aggregate)
    } else {
      return []
    }
  })
}