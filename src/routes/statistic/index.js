'use strict' 

module.exports = async (fastify) => { 
  fastify.register(require('./login'))
}