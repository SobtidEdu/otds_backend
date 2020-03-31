
'use strict'

const moment = require('moment')
const { TEMP_UPLOAD_PATH } = require('@config/storage')

module.exports = async (fastify, options) => {
  fastify.post('/upload', async (request, reply) => {
    const { upload } = request.raw.files
    let filename = moment(Date.now()).format('X').concat(upload.name)
    const pathFileName = `${TEMP_UPLOAD_PATH}/${filename}`
    await upload.mv(pathFileName, (err) => {
      return new Promise((resolve, reject) => {
        if (err) {
          console.log('error saving')
          reject(err)
        }

        resolve()
      })
    })
    const url = `${fastify.env.APP_URL}/storage/temp/${filename}`
    return {status: 200, uploaded: 1, fileName: filename, url }
  })
}