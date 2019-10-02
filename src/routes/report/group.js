'use strict'

const { ROLE, GROUP_STATUS } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

module.exports = async (fastify, options) => {

  fastify.get('/:examId/groups', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request) => {
    // const { user, params } = request

    // const aggregate = [
    //   {
    //     $match: { 
    //       $and: {
    //         userId: user._id, 
    //         "exams._id": params.examId
    //       }
    //     }
    //   },
    //   {
    //     $project: {
    //       logo: 1,
    //       name: 1,
    //       studentCount: 1
    //     }
    //   }
    // ]
    // const groupsReport = await fastify.mongoose.Group.aggregate(aggregate)
    // return groupsReport
    return [{
      _id: 1,
      logo: null,
      name: 'ป.1/1',
      totalStudent: 30,
      totalStudentTest: 4,
      startedAt: 1569572003,
      minScore: 10,
      maxScore: 20,
      minScore: 15,
    }]
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
      startedAt: 1569572003,
      totalTest: 3,
      score: 20
    },
    {
      logo: null,
      name: 'ด.ช. สมศักดิ์ ชูจิต',
      schoolName: 'มัธยมวัดสิงห์',
      startedAt: 1569572003,
      totalTest: 3,
      score: 18
    },
    {
      logo: null,
      name: 'ด.ช. mother fucker',
      schoolName: 'มัธยมวัดสิงห์',
      startedAt: 1569572003,
      totalTest: 4,
      score: 17
    }]
  })
}