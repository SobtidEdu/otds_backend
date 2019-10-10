'use strict'

module.exports = async (fastify, options) => {
  fastify.register(require('./school'), { prefix: 'schools' })
  fastify.register(require('./province'), { prefix: 'provinces' })
  fastify.register(require('./department'), { prefix: 'departments' })
  fastify.register(require('./prefix'), { prefix: 'prefixes' })
  fastify.register(require('./term'), { prefix: 'term'})
  fastify.register(require('./subject'), { prefix: 'subjects' })
  fastify.register(require('./contact'), { prefix: 'contact' })
  fastify.register(require('./faq'), { prefix: 'faq' })
}