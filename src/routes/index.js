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
  ajv.addKeyword('isExist', fastify.validators.isExist)

  fastify.decorate('validate', async (schema, request) => {
    for (let context in schema) {
      const validate = ajv.compile(schema[context].validation)

      try {
        const result = await validate(request[context])
      
        if (!result) {
          const e = new Error();
          
          e.errors = validate.errors

          throw e
        }
      } catch (e) {
        
        messageTemp = schema[context].message

        e.errors = e.errors.map(error => {
          console.log(error)
          let item = { keyword: error.keyword }

          if (error.keyword === 'required') {
            item.property = error.params.missingProperty
          } else {
            item.property = error.dataPath.substring(1)
          }

          item.message = messageTemp[item.property][item.keyword] || error.message
          return item
        })

        throw e 
      }

    }
    //     console.log(validate.errors)
    //   } catch (e) {
    //     console.log(e)
    //     messageTemp = schema[context].message
        
    //     e.errors = e.errors.map(error => {
    //       let item = { keyword: error.keyword }

    //       if (error.keyword === 'required') {
    //         item.property = error.params.missingProperty
    //       } else {
    //         item.property = error.dataPath.substring(1)
    //       }
    //       console.log(item)
    //       item.message = messageTemp[item.property][item.keyword] || error.message

    //       return item
    //     })

    //     throw e
    //   }
    // }
    
    // return;
  })

  fastify.register(require('./auth'), { prefix: 'auth' })
  fastify.register(require('./master'), { prefix: 'master' })
  fastify.register(require('./user'), { prefix: 'users' })
  fastify.register(require('./check'), { prefix: 'check' })
  fastify.register(require('./group'), { prefix: 'groups' })
  fastify.register(require('./exam'), { prefix: 'exams' })
  fastify.register(require('./testing'), { prefix: 'testing' })
  if (fastify.env.APP_ENV !== 'production') {
    fastify.get('/documentation', (request, reply) => reply.redirect('https://documenter.getpostman.com/view/6968221/S1Zz6pHb'))
    fastify.mongoose.instance.set('debug', true)
  }
}