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

      if (user.role === ROLE.STUDENT) {
        group.exams = group.exams.filter(exam => exam.status)
      }

      let examIdsArray = group.exams.map(exam => exam._id)
      
      const exams = await fastify.mongoose.Exam.aggregate([
        { 
          $match: {
            _id: { $in: examIdsArray },
            deletedAt: null
          }
        },
        { 
          $lookup: {
            from: 'testings',
            let: { id: '$_id' },
            pipeline: [
              { 
                $match: {
                  $expr: {
                    $eq: ['$examId', '$$id']
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

      if (group.exams && group.exams.length > 0) {
        examsNotInGroup = exams.filter(exam => group.exams.findIndex(groupExam => groupExam._id.toString() === exam._id.toString()) === -1)
      }

      return examsNotInGroup.map(exam => ({ ...exam, questionCount: exam.questions.length, questions: null }) )
    })
}
