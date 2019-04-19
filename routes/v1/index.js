module.exports = async (fastify, options) => {

  fastify.register(require('./auth.route'), { prefix: 'auth' })
  fastify.register(require('./user.route'), { prefix: 'users' })

}