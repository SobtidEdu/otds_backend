'use strict'

module.exports = async (fastify, options) => {
  fastify.register(require('./school'), { prefix: 'schools' })
  fastify.register(require('./province'), { prefix: 'provinces' })
  fastify.register(require('./department'), { prefix: 'departments' })
}