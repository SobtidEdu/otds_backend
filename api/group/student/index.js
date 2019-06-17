'use strict'
// const schema = require('./group.schema')
const uuid = require('uuid')

module.exports = async (fastify, options) => {
  const { ROLE } = fastify.config

  fastify.get('/:groupId/students', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
    ]
  }, async (request, reply) => {
  })

  fastify.post('/:groupId/students/join', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request, reply) => {
    const { user, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    const { requestToJoin, inGroup } = group.students
    
    if (inGroup.includes(user._id)) {
      throw fastify.httpErrors.badRequest(fastify.message('group.already_in_group'))
    }

    if (!requestToJoin.includes(user._id)) {
      await fastify.mongoose.Group.update({_id: group._id}, { $push: { 'students.requestToJoin' : user._id } })
    }
    
    return { message: fastify.message('group.requested_to_join') }
  })

  fastify.post('/:groupId/students/cancel', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request, reply) => {
    const { user, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    const { requestToJoin, inGroup } = group.students

    if (inGroup.includes(user._id)) {
      throw fastify.httpErrors.badRequest(fastify.message('group.already_in_group'))
    }

    if (!requestToJoin.includes(user._id)) {
      throw fastify.httpErrors.badRequest(fastify.message('group.did_not_request'))
    }

    await fastify.mongoose.Group.update({_id: group._id}, { $pull: { 'students.requestToJoin' : user._id } })

    return { message: fastify.message('group.cancelled_request') }
  })

  fastify.post('/:groupId/students/approve', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request, reply) => {
  })

  fastify.post('/:groupId/students/reject', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request, reply) => {
  })

  fastify.post('/:groupId/students/leave', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request, reply) => {
    const { user, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    
  })
}