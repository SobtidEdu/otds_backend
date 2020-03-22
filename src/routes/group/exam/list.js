'use strict' 

const { Types } = require('mongoose')
const { ROLE, GROUP_STATUS } = require('@config/user')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.get('/:groupId/exams', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate()
      ]
    }, async (request) => {
  
      const { user, params } = request;
      const group = await fastify.mongoose.Group.findOne({ _id: params.groupId })

      let examIdsArray = group.exams.map(exam => exam._id)
      
      let exams = await fastify.mongoose.Exam.aggregate([
        { 
          $match: {
            _id: { $in: examIdsArray },
            deletedAt: null
          }
        },
        { 
          $lookup: {
            from: 'testings',
            let: { examId: '$_id', groupId: group._id, userId: user._id },
            pipeline: [
              { 
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$examId', '$$examId'] },
                      { $eq: ['$groupId', '$$groupId'] },
                      { $eq: ['$userId', '$$userId'] }
                    ]
                  }
                }
              },
              { $sort: { finishedAt : 1 } },
              { $limit: 1 }
            ],
            as: 'testing'
          }
        },
        {
          $project: {
            _id: 1,
            code: 1,
            name: 1,
            type: 1,
            status: 1,
            subject: 1,
            testing: 1,
            oneTimeDone: 1
          }
        }
      ])

      if (user.role === ROLE.STUDENT) {
        exams = exams.filter(exam => exam.status === true)
      }

      return exams.map(exam => {
        const examInGroup = group.exams.find(examInGroup => examInGroup._id.toString() === exam._id.toString())
        return {...exam, statusInGroup: examInGroup.status, addedAt: examInGroup.addedAt}
      })
    })

    fastify.get('/:groupId/!exams', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate()
      ]
    }, async (request) => {
      const { params, user } = request

      const [group, exams] = await Promise.all([
        fastify.mongoose.Group.findOne({ _id: params.groupId, deletedAt: null }).lean(),
        fastify.mongoose.Exam.find({ owner: user._id, deletedAt: null }).lean(),
      ])

      let examsNotInGroup = []

      examsNotInGroup = exams.filter(exam => group.exams.findIndex(groupExam => groupExam._id.toString() === exam._id.toString()) === -1)

      return examsNotInGroup.map(exam => ({ ...exam, questionCount: exam.questions.length, questions: null }) )
    })
}
