const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('verifyUser', async (request, reply) => {
    await request.jwtVerify()
    const payload = await request.jwtVerify()
    const user = await fastify.mongoose.User.findOne({ _id: payload._id })

    if (user.isLoggedOut) throw this.httpErrors.unauthorized()
    request.user = user
  })
})