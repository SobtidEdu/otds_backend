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
    
    const aggregateMember = [
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
        $lookup: {
          from: 'groups', 
          localField: '_id.groupId', 
          foreignField: '_id', 
          as: 'group'
        }
      },
      {
        $unwind: { path: '$group', preserveNullAndEmptyArrays: true }
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
          group: {
            _id: 1,
            name: 1
          },
          testingId: 1,
          latestStartedAt: 1,
          count: 1,
          latestScore: 1,
        }
      },
      {
        $sort: { latestStartedAt: -1 }
      }
    ]

    const aggregateGuest = [
      {
        $match: { 
          examId: mongoose.Types.ObjectId(params.examId),
          finishedAt: { $ne: null },
          userId: { $exists: false }
        }
      },
      {
        $project: {
          testingId: 1,
          latestStartedAt: "$startedAt",
          count: { $literal: 1 },
          latestScore: "$score"
        }
      },
      {
        $sort: { latestStartedAt: 1 }
      }
    ]
    
    const [member, guest] = await Promise.all([
      fastify.mongoose.Testing.aggregate(aggregateMember),
      fastify.mongoose.Testing.aggregate(aggregateGuest)
    ])

    const response = member.concat(guest.map((g, index) => ({
      _id: {},
      ...g,
      user: {
        profileImage: '',
        prefixName: '',
        firstName: `Guest${index+1}`,
        lastName: '',
        school: null,
      }
    })))
    // return response
    const studentListOfExam = response
    .map(data => ({
      userId: data._id.userId || null,
      groupId: data._id.groupId || null,
      profileImage: data.user.profileImage ? fastify.storage.getUrlProfileImage(data.user.profileImage) : null,
      name: `${data.user.prefixName} ${data.user.firstName} ${data.user.lastName}`,
      schoolName: data.user.school ? data.user.school.name.text : null,
      testingId: data.testingId,
      latestStartedAt: data.latestStartedAt,
      count: data.count,
      latestScore: data.latestScore,
      isInGroup: !!data._id.groupId,
      group: data.group || null
    }))

    const statsOfExam = {
      min: studentListOfExam.length > 0 ? studentListOfExam.reduce((score, testing) => score > testing.latestScore ? testing.latestScore : score, studentListOfExam[0].latestScore) : 0,
      max: studentListOfExam.length > 0 ? studentListOfExam.reduce((score, testing) => score < testing.latestScore ? testing.latestScore : score, studentListOfExam[0].latestScore) : 0,
      avg: studentListOfExam.length > 0 ? studentListOfExam.reduce((score, testing) => score + testing.latestScore, 0) / studentListOfExam.length : 0
    }

    return { studentListOfExam, statsOfExam }
  })
}