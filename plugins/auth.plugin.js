const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('authenticate', async (request, reply) => {
    const payload = await request.jwtVerify()
    const user = await fastify.mongoose.User.findOne({ _id: payload._id })

    if (!user) throw fastify.httpErrors.unauthorized()
    
    const { isConfirmationEmail, isLoggedOut, isBanned } = user

    if ( !isConfirmationEmail || isLoggedOut || isBanned ) throw fastify.httpErrors.unauthorized()

    return request.user = user
  })

  fastify.decorate('authorize', (roles) => async (request, reply) => {
    if (roles.indexOf(request.user.role) === -1) throw fastify.httpErrors.forbidden()
  })
})