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
    
    // FIXME: ยังไม่เสร็จเลย
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
          totalStudent: { 
            { $cond : [{ $eq: ['$students.status', STUDENT_STATUS.JOIN] }, { $sum: 1 }, 0] } 
          },
          exams: 1
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
      // {
      //   $unwind: '$testings'
      // },
      // {
      //   $group: { 
      //     _id: {
      //       groupId: "$_id", 
      //       userId: "$testings.user", 
      //     },
      //     startedAt: { $last: "$testings.startedAt" },
      //     latestScore: { $last: "$testings.score" },
      //     logo: { $first: "$logo" },
      //     name: { $first: "$name" },
      //     totalStudent: { $first: "$totalStudent" },
      //   }
      // }
    ]

    const response = await fastify.mongoose.Group.aggregate(aggregate)
    return response
    // return [{
    //   _id: 1,
    //   logo: null,
    //   name: 'ป.1/1',
    //   totalStudent: 30,
    //   totalStudentTest: 4,
    //   latestStartedAt: 1569572003,
    //   minScore: 10,
    //   maxScore: 20,
    //   avgScore: 15,
    // }]
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