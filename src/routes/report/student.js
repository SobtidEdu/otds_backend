'use strict'

const { ROLE, GROUP_STATUS } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

var mongoose = require('mongoose');

module.exports = async (fastify, options) => {

  fastify.get('/:examId/students', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request) => {
    const { user, params } = request
    
    const aggregate = [
      {
        $match: { 
          examId: mongoose.Types.ObjectId(params.examId),
          finishedAt: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            groupId: "$groupId",
          },
          testingId: { $last: "$_id"},
          count: { $sum: 1 },
          latestStartedAt: { $last: "$startedAt" },
          latestScore: { $last: "$score" }
        }
      },
      {
        $lookup: {
          from: 'users', 
          localField: '_id.userId', 
          foreignField: '_id', 
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            profileImage: 1,
            prefixName: 1,
            firstName: 1,
            lastName: 1,
            school: 1,
          },
          testingId: 1,
          latestStartedAt: 1,
          count: 1,
          latestScore: 1,
        }
      }
    ]
    
    const response = await fastify.mongoose.Testing.aggregate(aggregate)
    // return response
    return response.map(data => ({
      userId: data._id.userId,
      groupId: data._id.groupId,
      profileImage: data.user.profileImage,
      name: `${data.user.prefixName} ${data.user.firstName} ${data.user.lastName}`,
      schoolName: data.user.school.name.text,
      testingId: data.testingId,
      latestStartedAt: data.latestStartedAt,
      count: data.count,
      latestScore: data.latestScore,
      testingId: data.testingId,
      isInGroup: (data._id.groupId !== undefined)
    }))
  })
}