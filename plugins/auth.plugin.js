const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('authenticate', async (request, reply) => {
    const payload = await request.jwtVerify()
    const user = await fastify.mongoose.User.findOne({ _id: payload._id })
    
    const { isConfirmationEmail, isLoggedOut, isBanned } = user

    if ( !isConfirmationEmail || isLoggedOut || isBanned ) throw this.httpErrors.unauthorized()
    
    request.user = user
  })

  fastify.decorate('authorize', async (roles) =>  {
    return async (request, reply) => {
      console.log(roles);
      console.log(roles.indexOf(request.user.role))
      return roles.indexOf(request.user.role) !== -1
    }
  })
})