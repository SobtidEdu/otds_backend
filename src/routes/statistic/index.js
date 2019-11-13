'use strict' 

module.exports = async (fastify) => { 
  fastify.register(require('./login'))
  fastify.register(require('./exam'))
  fastify.register(require('./testing'))
}