module.exports = async (fastify, options) => {

  fastify.register(require('./auth'), { prefix: 'auth' })
  fastify.register(require('./general'), { prefix: 'general' })
  // fastify.register(require('./user.route'), { prefix: 'users' })
}