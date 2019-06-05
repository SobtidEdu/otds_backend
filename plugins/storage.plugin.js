const fp = require('fastify-plugin')
const base64ToImage = require('base64-to-image')
const path = require('path')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('storage', {
    diskProfileImage: (dataBase64, fileName, imageType = 'png') => {
      const dirpath = path.resolve(fastify.config.PROFILE_IMAGE_PATH)
      const option = { fileName, imageType }
      return base64ToImage(dataBase64, `${dirpath}/`, option)
    },
    getUrlProfileImage: (filename) => {
      return `${fastify.env.APP_URL}/${fastify.config.PROFILE_IMAGE_PATH}/${filename}`
    },

    diskGroupLogo: (dataBase64, fileName, imageType = 'png') => {
      const dirpath = path.resolve(fastify.config.GROUP_LOGO_PATH)
      const option = { fileName, imageType }
      return base64ToImage(dataBase64, `${dirpath}/`, option)
    },
    getUrlGroupLogo: (filename) => {
      return `${fastify.env.APP_URL}/${fastify.config.GROUP_LOGO_PATH}/${filename}`
    }
  })
})