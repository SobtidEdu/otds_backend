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
          let: { groupId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $and: [
                    { $eq: [ '$examId', mongoose.Types.ObjectId(params.examId) ] },
                    { $eq: [ '$groupId', '$$groupId' ] },
                    { $ne: [ '$finishedAt', null ] }
                  ]
                }
              }
            },
            { $project: { _id: 1, startedAt: 1, finishedAt: 1, examId: 1, userId: 1, groupId: 1, score: 1 } },
            { 
              $group: {
                _id: "$userId",
                score: { $last: "$score" },
                startedAt: { $last: "$startedAt" },
                finishedAt: { $last: "$finishedAt" }
              }
            },
            {
              $sort: { finishedAt: -1 }
            }
          ],
          as: 'testing'
        }
      },
      { $unwind: "$testing" },
      {
        $project: { testings: { progressTestings: 0 } }
      },
      {
        $group: { 
          _id: "$_id",
          totalStudentTestings: { $sum: 1 },
          latestStartedAt: { $last: "$testing.startedAt" },
          latestScore: { $last: "$testing.score" },
          logo: { $first: "$logo" },
          name: { $first: "$name" },
          totalStudent: { $first: "$totalStudent" },
          minScore: { $min: "$testing.score" },
          maxScore: { $max: "$testing.score" },
          avgScore: { $avg: "$testing.score" }
        }
      }
    ]

    const response = await fastify.mongoose.Group.aggregate(aggregate)
    return response
    .map(data => ({
      _id: data._id,
      totalStudentTestings: data.totalStudentTestings,
      latestStartedAt: data.latestStartedAt,
      latestScore: data.latestScore,
      name: data.name,
      logo: fastify.storage.getUrlGroupLogo(data.logo),
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
      ]

      const aggregateTestingList = [
        {
          $match: { 
            examId: mongoose.Types.ObjectId(params.examId),
            groupId: mongoose.Types.ObjectId(params.groupId),
            userId: mongoose.Types.ObjectId(user._id),
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

      response[0] = response[0].sort((a, b) => (a._id < b._id) ? 1 : (a._id > b._id) ? -1 : 0)

      const myMaxScoreTesting = response[1].reduce((score, testing) => testing.score > score ? testing.score : score, 0)
      const myBestTesting = response[1].find(testing => testing.score === myMaxScoreTesting)
      
      const testingStats = {
        rankingNo: myBestTesting ? response[0].findIndex(testing => testing._id == myBestTesting.score) + 1 : null,
        startedAt: myBestTesting ? myBestTesting.startedAt: null,
        maxScore: response[0].length > 0 ? response[0].reduce((score, testing) => testing._id > score ? testing._id : score, response[0][0]._id) : null,
        minScore: response[0].length > 0 ? response[0].reduce((score, testing) => testing._id < score ? testing._id : score, response[0][0]._id) : null,
        avgScore: response[0].length > 0 ? (response[0].reduce((score, testing) => testing._id + score, 0) / response[0].length) : null
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
        },
        {
          $sort: {
            latestScore: -1
          }
        }
      ]
      
      const response = await fastify.mongoose.Testing.aggregate(aggregate)
      // return response
      return response.map(data => ({
        userId: data._id,
        profileImage: fastify.storage.getUrlProfileImage(data.user.profileImage),
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