const moment = require('moment')

const packError = (message = '', errors = {}) => {
  return { message, errors, timestamp: moment().unix() }
}

const transformValidateErrors = (errorValidation) => {
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
}

module.exports = {
  packError,
  transformValidateErrors
}