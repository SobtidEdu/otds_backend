const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('authenticate', (options) => {

    return async (request, reply) => {
      let payload = {}
      try {
        payload = await request.jwtVerify()
      } catch (e) {
        if (options.allowGuest) return;
        throw e
      }
      
      const user = await fastify.mongoose.User.findOne({ _id: payload._id }).select('-password')
      
      if (!user) throw fastify.httpErrors.unauthorized()
    
      const { isConfirmationEmail, isLoggedOut, isBanned } = user

      if ( !isConfirmationEmail || isLoggedOut || isBanned ) throw fastify.httpErrors.unauthorized()

      return request.user = user
    }
  })

  fastify.decorate('authorize', (roles) => async (request, reply) => {
    if (roles.indexOf(request.user.role) === -1) throw fastify.httpErrors.forbidden()
  })
})