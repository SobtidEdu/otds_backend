'use strict'

module.exports = async (fastify, options) => {
  fastify.register(require('./list'))
  fastify.register(require('./create'))
  fastify.register(require('./update'))
  fastify.register(require('./remove'))
  fastify.register(require('./contact'))
}