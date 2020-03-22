'use strict' 

const { TESTING_UPLOAD_PATH } = require('@config/storage')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/:testingId/question/:questionId/upload', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ],
    bodyLimit: 6452595 // limit 6.2 mb,
  }, async (request) => {
    const { user, body, params } = request
    const { noteFile } = request.raw.files

    const extension = noteFile.name.substring(noteFile.name.length-3)
    const fileName = `${params.testingId}_${params.questionId}.${extension}`
    
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
