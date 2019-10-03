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
      {
        $unwind: '$testings'
      },
      {
        $group: { 
          _id: {
            groupId: "$_id", 
            userId: "$testings.user", 
          },
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
    return response.map(data => ({
      _id: data._id.groupId,
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
      fastify.authenticate()
    ]
  }, async (request) => {

    return [{
      logo: null,
      name: 'ด.ช. ราตรี สูงนาน',
      schoolName: 'มัธยมด่านสำโรง',
      latestStartedAt: 1569572003,
      totalTest: 3,
      latestScore: 20
    },
    {
      logo: null,
      name: 'ด.ช. สมศักดิ์ ชูจิต',
      schoolName: 'มัธยมวัดสิงห์',
      latestStartedAt: 1569572003,
      totalTest: 3,
      latestScore: 18
    },
    {
      logo: null,
      name: 'ด.ช. mother fucker',
      schoolName: 'มัธยมวัดสิงห์',
      latestStartedAt: 1569572003,
      totalTest: 4,
      latestScore: 17
    }]
  })
}