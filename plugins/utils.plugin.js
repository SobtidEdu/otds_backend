const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('utils', {
    randomString: () => {
      return Math.random().toString(36).substring(2)
    }
  })
})