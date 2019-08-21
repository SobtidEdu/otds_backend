const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('utils', {
    randomString: () => {
      return Math.random().toString(36).substring(2)
    },

    capitalize: (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  })
})