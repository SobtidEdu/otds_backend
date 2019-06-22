require('module-alias/register')
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
const path = require('path')
const fs = require("fs")

const fastify = require('fastify')({
  logger: {
    prettyPrint: true,
  },
  ignoreTrailingSlash: true,
  querystringParser: str => qs.parse(str),
  maxParamLength: 300
})

/*****
 * Bootstrap
 *****/
fastify.decorate('env', process.env)
fastify.decorate('config', require('@root/config'))
if (!fs.existsSync(fastify.config.PROFILE_IMAGE_PATH)) {
  fs.mkdirSync(fastify.config.PROFILE_IMAGE_PATH, { recursive: true, mode: 0755 })
}

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
  secure: fastify.env.APP_ENV !== 'local',
  auth: {
    user: fastify.env.EMAIL_USERNAME,
    pass: fastify.env.EMAIL_PASSWORD
  }
})
fastify.register(require('fastify-cors'), { 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'storage'),
  prefix: '/storage/'
})

/*****
 * Internal Plugin
 *****/ 
fastify.register(require('./src/plugins/paginate.plugin'))
fastify.register(require('./src/plugins/handle-error.plugin'))
fastify.register(require('./src/plugins/utils.plugin'))
fastify.register(require('./src/plugins/auth.plugin'))
fastify.register(require('./src/plugins/html-template.plugin'))
fastify.register(require('./src/plugins/validators.plugin'))
fastify.register(require('./src/plugins/storage.plugin'))
fastify.register(require('./src/plugins/language.plugin'))

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
fastify.register(
  require("fastify-mongoose-driver"),
  {
    uri: `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`,
    settings: {
      useNewUrlParser: true,
      // config: {
      //   autoIndex: true
      // }
      useCreateIndex: true,
      // debug: true
    },
    models: require('./src/models')
  },
)

/**
 * Route Setup
 */
fastify.register(require('./src/api'), { prefix: '/api' })

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

  if (reply.res.statusCode === 403) {
    errorResponse.message = 'ไม่อนุญาตให้เข้าใช้บริการนี้'
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