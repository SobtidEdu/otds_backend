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
    if (user.role === ROLE.ADMIN) {}
    else if (user.role === ROLE.STUDENT) {
      finder = { visible: 'student', isActive: true }
    }
    else if (user.role === ROLE.TEACHER || user.role === ROLE.SUPER_TEACHER) {
      finder = { visible: 'teahcer', isActive: true }
    } else {
      finder = { visible: 'guest', isActive: true }
    }
    return await fastify.mongoose.FAQ.find(finder)
  })
}