const fp = require('fastify-plugin')
const { ROLE } = require('@config/user')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('authenticate', (options = { allowGuest: false }) => {

    return async (request, reply) => {
      let payload = {}
      try {
        payload = await request.jwtVerify()
      } catch (e) {
        if (options.allowGuest) return;
        throw e
      }
      
      const user = await fastify.mongoose.User.findOne({ _id: payload._id })
      
      if (!user) throw fastify.httpErrors.unauthorized()
    
      const { isConfirmationEmail, isLoggedOut, isBanned } = user

      if ( (!isConfirmationEmail && user.role === ROLE.TEACHER) || isLoggedOut || isBanned ) throw fastify.httpErrors.unauthorized()

      return request.user = user
    }
  })

  fastify.decorate('authorize', (roles) => async (request, reply) => {
    if (roles.indexOf(request.user.role) === -1) throw fastify.httpErrors.forbidden()
  })
})