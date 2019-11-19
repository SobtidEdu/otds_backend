const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('validators', {
    isExist: {
      async: true,
      type: 'string',
      validate: async (schema, data) => {
        if (schema.prop === 'email' || schema.prop === 'username') {
          if (!data) return true
          data = data.toLowerCase()
        }
        
        const rows = await fastify.mongoose.instance.models[schema.collection].countDocuments({ [schema.prop]: data })
        return rows === 0
      }
    },
  })
})