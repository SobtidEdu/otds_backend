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

      const exams = await fastify.mongoose.Exam.find({ _id: { $in: examIdsArray } }).select('_id code name type status').lean()
      return exams.map(exam => {
        const examInGroup = group.exams.find(examInGroup => examInGroup.status === exam.status)
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
      const { params, user } = request;

      const [group, exams] = await Promise.all([
        fastify.mongoose.Group.findOne({ _id: params.groupId }),
        fastify.mongoose.Exam.find({ ownerId: user._id }),
      ])

      const examsNotInGroup = exams.filter(exam => {
        
        return group.exams.findIndex(groupExam => groupExam._id == exam._id) === -1
      })

      return examsNotInGroup
      // const exams = await fastify.mongoose.Exam.find({ _id: { $in: examIdsArray } }).select('_id code name type status').lean()
      // return exams.map(exam => {
      //   const examInGroup = group.exams.find(examInGroup => examInGroup.status === exam.status)
      //   return {...exam, statusInGroup: examInGroup.status, addedAt: examInGroup.addedAt}
      // })
    })
}
