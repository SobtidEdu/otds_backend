'use strict' 

const { TESTING_UPLOAD_PATH } = require('@config/storage')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/:testingId/upload', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ],
  }, async (request) => {
    const { user, body, params } = request
    const { questionId } = body
    const { noteFile } = request.raw.files

    const fileName = `${params.testingId}_${questionId}`
    
    const pathFileName = `${TESTING_UPLOAD_PATH}/${fileName}`
    
    const testing = await fastify.mongoose.Testing.findOne({ _id: params.testingId, userId: user._id })
    if (!testing) throw fastify.httpErrors.notFound(`Not found testing id: ${params.testingId}`)

    await noteFile.mv(pathFileName, (err) => {
      return new Promise((resolve, reject) => {
        if (err) {
          console.log('error saving')
          reject(err)
        }

        resolve()
      })
    })

    return { filename: 'marked', fileName }
  })
}
