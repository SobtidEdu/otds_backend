'use strict' 

module.exports = async (fastify) => { 
  fastify.register(require('./login'))
  fastify.register(require('./exam'))
  fastify.register(require('./testing-start'))
  fastify.register(require('./testing-finish'))
  fastify.register(require('./user'))
}