const fp = require('fastify-plugin')
const base64ToImage = require('base64-to-image')
const path = require('path')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('storage', {
    diskProfileImage: (dataBase64, fileName, imageType = 'png') => {
      const dirpath = path.resolve('storage', 'profile-images')
      const option = { fileName, imageType }
      return base64ToImage(dataBase64, `${dirpath}/`, option)
    }
  })
})