const Ajv = require('ajv')
const ajv = new Ajv({
  // the fastify defaults (if needed)
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  allErrors: true,
  jsonPointers: true
})
require('ajv-errors')(ajv);

module.exports = async (fastify, options) => {
  ajv.addKeyword('isNotExist', fastify.validators.isNotExist)

  fastify.decorate('validate', async (schema, request) => {
    for (let context in schema) {
      const validate = ajv.compile(schema[context].validation)
      try {
        await validate(request[context])
      } catch (e) {
        console.log(e)
        messageTemp = schema[context].message

        e.errors = e.errors.map(error => {
          let item = { keyword: error.keyword }

          if (error.keyword === 'required') {
            item.property = error.params.missingProperty
          } else {
            item.property = error.dataPath.substring(1)
          }
          console.log(item)
          item.message = messageTemp[item.property][item.keyword] || error.message

          return item
        })

        throw e
      }
    }
    
    return;
  })

  fastify.register(require('./auth'), { prefix: 'auth' })
  fastify.register(require('./master'), { prefix: 'master' })
  fastify.register(require('./check'), { prefix: 'check' })
  fastify.register(require('./group'), { prefix: 'groups' })
  if (fastify.env.APP_ENV !== 'production') {
    fastify.register(require('./dev'), { prefix: 'dev' })
  }
}