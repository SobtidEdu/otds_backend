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

    const group = await fastify.mongoose.Group.findOne(params.groupId).select('students.requestToJoin')
    
    
  })

  fastify.post('/:groupId/students/cancel', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request, reply) => {
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

}