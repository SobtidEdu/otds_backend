'use strict'

module.exports = async (fastify, options) => {
  fastify.register(require('./school'), { prefix: 'schools' })
  fastify.register(require('./province'), { prefix: 'provinces' })
  // fastify.register(require('./country'), { prefix: 'countries' })
  // fastify.register(require('./auth'), { prefix: 'auth' })
}