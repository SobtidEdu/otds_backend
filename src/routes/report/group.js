'use strict'

const { ROLE, GROUP_STATUS } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

var mongoose = require('mongoose');

module.exports = async (fastify, options) => {

  fastify.get('/:examId/groups', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request) => {
    const { user, params } = request
    
    const aggregate = [
      {
        $match: {
          exams: {
            $elemMatch: {
              _id: mongoose.Types.ObjectId(params.examId)
            }
          }
        }
      },
      {
        $project: {
          logo: 1,
          name: 1,
          totalStudent: { $size: "$students" }, // FIXME: เอาจำนวนที่ นร ที่อยู่ในกลุ่มอย่างเดียว
          exams: 1,
        }
      },
      {
        $unwind: '$exams'
      },
      {
        $match: {
          'exams._id': mongoose.Types.ObjectId(params.examId)
        }
      },
      { 
        $lookup: { 
          from: 'testings', 
          localField: 'exams._id', 
          foreignField: 'examId', 
          as: 'testings'
        }
      }, 
      { $unwind: "$testings" },
      {
        $redact: {
          $cond: [
            { $ne: [ "$finishedAt", null] }, 
            "$$KEEP", 
            "$$PRUNE"
          ]
        }
      },
      {
        $project: { testings: { progressTestings: 0 } }
      },
      {
        $group: { 
          _id: {
            groupId: "$_id", 
          },
          studentTestings: { $addToSet : "$testings.userId" },
          latestStartedAt: { $last: "$testings.startedAt" },
          latestScore: { $last: "$testings.score" },
          logo: { $first: "$logo" },
          name: { $first: "$name" },
          totalStudent: { $first: "$totalStudent" },
          minScore: { $min: "$testings.score" },
          maxScore: { $max: "$testings.score" },
          avgScore: { $avg: "$testings.score" }
        }
      }
    ]

    const response = await fastify.mongoose.Group.aggregate(aggregate)
    return response
    .map(data => ({
      _id: data._id.groupId,
      totalStudentTestings: data.studentTestings.length,
      latestStartedAt: data.latestStartedAt,
      latestScore: data.latestScore,
      name: data.name,
      logo: data.logo,
      totalStudent: data.totalStudent,
      minScore: data.minScore,
      maxScore: data.maxScore,
      avgScore: data.avgScore
    }))
  })

  fastify.get('/:examId/group/:groupId', {
    preValidation: [
      fastify.authenticate(),
    ]
  }, async (request) => {
    const { user, params } = request

    if (user.role === ROLE.STUDENT) {
      const aggregateTestingStat = [
        {
          $match: { 
            examId: mongoose.Types.ObjectId(params.examId),
            groupId: mongoose.Types.ObjectId(params.groupId),
            finishedAt: { $ne: null }
          }
        },
        {
          $group: {
            _id: { $max: "$score" }
          }
        },
        {
          $sort: { score: -1 }
        }
      ]

      const aggregateTestingList = [
        {
          $match: { 
            examId: mongoose.Types.ObjectId(params.examId),
            groupId: mongoose.Types.ObjectId(params.groupId),
            userId: mongoose.Types.ObjectId(params.userId),
            finishedAt: { $ne: null }
          }
        },
        {
          $sort: { startedAt: -1 }
        }
      ]

      const response = await Promise.all([
        fastify.mongoose.Testing.aggregate(aggregateTestingStat),
        fastify.mongoose.Testing.aggregate(aggregateTestingList)
      ])

      const myMaxScoreTesting = response[1].reduce((score, testing) => testing.score > score ? testing.score : score, 0)
      const myBestTesting = response[1].find(testing => testing.score === myMaxScoreTesting)
      const testingStats = {
        rankingNo: myBestTesting ? response[0].findIndex(testing => testing.score == myBestTesting._id) + 1 : null,
        startedAt: myBestTesting ? myBestTesting.startedAt: null,
        maxScore: myMaxScoreTesting,
        maxScore: response[1].reduce((score, testing) => testing.score < score ? testing.score : score, 0),
        avgScore: response[1].reduce((score, testing) => testing.score + score, 0)
      }
      return {
        testingStats,
        testingsList: response[1].map(data => ({
          testingId: data._id,
          startedAt: data.startedAt,
          finishedAt: data.finishedAt,
          score: data.score,
        }))
      }
    } else {
      const aggregate = [
        {
          $match: { 
            examId: mongoose.Types.ObjectId(params.examId),
            groupId: mongoose.Types.ObjectId(params.groupId),
            finishedAt: { $ne: null }
          }
        },
        {
          $group: {
            _id: "$userId",
            testingId: { $last: "$_id"},
            count: { $sum: 1 },
            latestStartedAt: { $last: "$startedAt" },
            latestScore: { $last: "$score" }
          }
        },
        {
          $lookup: {
            from: 'users', 
            localField: '_id', 
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
        userId: data._id,
        profileImage: data.user.profileImage,
        name: `${data.user.prefixName} ${data.user.firstName} ${data.user.lastName}`,
        schoolName: data.user.school.name.text,
        testingId: data.testingId,
        latestStartedAt: data.latestStartedAt,
        count: data.count,
        latestScore: data.latestScore,
        testingId: data.testingId,
      }))
    }
    
  })
}