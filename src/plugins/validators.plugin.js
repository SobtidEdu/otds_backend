const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('validators', {
    isExist: {
      async: true,
      type: 'string',
      validate: async (schema, data) => {
        if (schema.prop === 'email') data = data.toLowerCase()
        const rows = await fastify.mongoose.instance.models[schema.collection].count({ [schema.prop]: data })
        return rows === 0
      }
    },
  })
})