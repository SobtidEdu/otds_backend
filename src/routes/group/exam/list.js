'use strict' 

const { Types } = require('mongoose')
const { ROLE, GROUP_STAUS } = require('@config/user')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.get('/:groupId/exams', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
      ]
    }, async (request) => {
  
      const { params } = request;
      const group = await fastify.mongoose.Group.findOne({ _id: params.groupId })

      const examIdsArray = group.exams.map(exam => exam._id)

      const exams = await fastify.mongoose.Exam.find({ _id: { $in: examIdsArray } }).select('_id code name type status subject').lean()
      return exams.map(exam => {
        const examInGroup = group.exams.find(examInGroup => examInGroup._id.toString() === exam._id.toString())
        return {...exam, statusInGroup: examInGroup.status, addedAt: examInGroup.addedAt}
      })
    })

    fastify.get('/:groupId/!exams', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
      ]
    }, async (request) => {
      const { params, user } = request

      const [group, exams] = await Promise.all([
        fastify.mongoose.Group.findOne({ _id: params.groupId }).lean(),
        fastify.mongoose.Exam.find({ owner: user._id }).lean(),
      ])

      const examsNotInGroup = group.exams ? exams
        .filter(exam => group.exams.findIndex(groupExam => groupExam._id.toString() == exam._id) === -1)
        .map(exam => {
          return Object.assign(exam, { questionCount: exam.questions.length })
        }) : []

      return examsNotInGroup
    })
}
