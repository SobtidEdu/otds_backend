const fp = require('fastify-plugin')
const moment = require('moment')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('handleError', {
    
    response: (message = '', errors = {}) => {
      return { message, errors, timestamp: moment().unix() }
    },

    transformValidateErrors(errorValidation) {
      let errorContainer = {}
      for (error of errorValidation) {
        
        const { missingProperty } = error.params.errors[0].params

        if (missingProperty !== undefined) {
          errorContainer[missingProperty] = error.message
        } else {
          errorContainer[error.dataPath.substring(1)] = error.message
        }
      }
      return errorContainer
    },

    isNotFoundId(error) {
      return (error.name === 'CastError' && error.kind === 'ObjectId')
    }
  })
})