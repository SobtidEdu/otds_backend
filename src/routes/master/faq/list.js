'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.get('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ]
  }, async (request) => {
    const { user } = request
    let finder = {}

    if (!user) {
      finder = { visible: 'guest', isActive: true }
    }
    else if (user.role === ROLE.STUDENT) {
      finder = { visible: 'student', isActive: true }
    }
    else if (user.role === ROLE.TEACHER || user.role === ROLE.SUPER_TEACHER) {
      finder = { visible: 'teacher', isActive: true }
    }
    
    return await fastify.mongoose.FAQ.find(finder)
  })
}