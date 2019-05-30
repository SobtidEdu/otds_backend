require('dotenv').config()
// const Ajv = require('ajv')
// const ajv = new Ajv({
//   // the fastify defaults (if needed)
//   removeAdditional: true,
//   useDefaults: true,
//   coerceTypes: true,
//   allErrors: true,
//   jsonPointers: true
// })
// require('ajv-errors')(ajv);
const qs = require('qs')
const fileUpload = require('fastify-file-upload')
const moment = require('moment')

const fastify = require('fastify')({
  logger: {
    prettyPrint: true,
  },
  ignoreTrailingSlash: true,
  querystringParser: str => qs.parse(str),
})

fastify.decorate('env', process.env)
fastify.decorate('config', require('./config'))
fastify.decorate('moment', moment())

/*****
 * External Plugin
 *****/
fastify.register(fileUpload)
fastify.register(require('fastify-sensible'), { errorHandler: false })
fastify.register(require('fastify-auth'))
fastify.register(require('fastify-jwt'), {
  secret: fastify.env.JWT_SECRET,
  sign: {
    audience: 'otds.user',
    issuer: 'onlinetesting.ipst.ac.th',
    expiresIn: '1d'
  },
  verify: {
    audience: 'otds.user',
    issuer: 'onlinetesting.ipst.ac.th',
  }
})
fastify.register(require('fastify-nodemailer'), {
  pool: true,
  host: fastify.env.EMAIL_HOST,
  port: fastify.env.EMAIL_PORT,
  secure: false, // use TLS
  auth: {
    user: fastify.env.EMAIL_USERNAME,
    pass: fastify.env.EMAIL_PASSWORD
  }
})

/*****
 * Internal Plugin
 *****/ 
fastify.register(require('./plugins/paginate.plugin'))
fastify.register(require('./plugins/handle-error.plugin'))
fastify.register(require('./plugins/utils.plugin'))
fastify.register(require('./plugins/auth.plugin'))
fastify.register(require('./plugins/html-template.plugin'))
fastify.register(require('./plugins/validators.plugin'))

/*****
 * Database Connection 
 *****/ 
const {
  MONGO_HOST,
  MONGO_PORT,
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_DBNAME
} = fastify.env
console.log(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`)
fastify.register(
  require("fastify-mongoose-driver"),
  {
    uri: `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`,
    settings: {
      useNewUrlParser: true,
      config: {
        autoIndex: true
      }
    },
    models: require('./models')
  },
)

/**
 * Route Setup
 */
fastify.register(require('./api'), { prefix: '/api' })

fastify.setErrorHandler(async (error, request, reply) => {
  console.debug(error)
  const errorResponse = { message: error.message, errors: {}, timestamp: moment().unix() }
  
  if (error.validation) {
    errorResponse.message = 'ข้อมูลไม่ถูกต้อง'
    errorResponse.errors = error.errors
    return reply.code(422).send(errorResponse)
  }
  
  if (reply.res.statusCode === 401) {
    errorResponse.message = 'กรุณายืนยันตัวตน'
  }

  return errorResponse
})

fastify.ready((err) => {
  if (err) {
    console.log(err)
    process.exit()
  }
  console.log(fastify.printRoutes())
})
const start = async () => {
  try {
    await fastify.listen(3000, '0.0.0.0')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// process.on('SIGINT', async () => {
//   console.log('stopping fastify server');
//   await fastify.close();
//   console.log('fastify server stopped');
//   process.exit(0);
// });

start()

module.exports = fastify