const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('validators', {
    isNotExist: {
      async: true,
      type: 'string',
      validate: async (schema, data) => {
        console.log(await fastify.mongoose.instance.models[schema.collection].count({ [schema.prop]: data }))
        const rows = await fastify.mongoose.instance.models[schema.collection].count({ [schema.prop]: data })
        return rows === 0
      }
    },
  })
})