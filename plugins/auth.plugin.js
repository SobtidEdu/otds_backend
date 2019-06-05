const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('verifyUser', async (request, reply) => {
    const payload = await request.jwtVerify()
    const user = await fastify.mongoose.User.findOne({ _id: payload._id })
    
    const { isConfirmationEmail, isLoggedOut, isBanned } = user

    if ( !isConfirmationEmail || isLoggedOut || isBanned ) throw this.httpErrors.unauthorized()
    
    request.user = user
  })
})