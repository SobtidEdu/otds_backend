require('dotenv').config()
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
const qs = require('qs')
const { transformValidateErrors, packError } = require('./helper')
const fileUpload = require('fastify-file-upload')

const fastify = require('fastify')({
  logger: {
    prettyPrint: true,
  },
  ignoreTrailingSlash: true,
  querystringParser: str => qs.parse(str),
})

fastify.decorate('env', process.env)
fastify.decorate('config', require('./config'))
fastify.decorate('moment', require('moment'))

/*****
 * External Plugin
 *****/
fastify.setSchemaCompiler(function (schema) {
  return ajv.compile(schema)
})
fastify.register(fileUpload)

/*****
 * Internal Plugin
 *****/ 
fastify.register(require('./plugins/paginate.plugin'))


/*****
 * Database Connection 
 *****/ 
fastify.register(
  require("fastify-mongoose-driver"),
  {
    uri: fastify.env.MONGODB_URL,
    settings: {
      useNewUrlParser: true,
      config: {
        autoIndex: true
      }
    },
    models: require('./models')
  },
)

fastify.register(require('./api'), { prefix: '/api' })

fastify.setErrorHandler(async (error, request, reply) => {
  console.log(error)
  if (error.validation) {
    return reply.status(422).send(packError('ข้อมูลไม่ถูกต้อง', transformValidateErrors(error.validation)))
  }
  return packError(error.message)
})

fastify.ready((err) => {
  if (err) throw err
  console.log(fastify.printRoutes())
})
const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()