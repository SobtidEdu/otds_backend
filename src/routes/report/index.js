'use strict' 

module.exports = async (fastify) => { 
  fastify.register(require('./list'))
  fastify.register(require('./group'))
  fastify.register(require('./student'))
}