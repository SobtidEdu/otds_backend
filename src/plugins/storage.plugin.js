const fp = require('fastify-plugin')
const base64ToImage = require('base64-to-image')
const path = require('path')
const fs = require('fs')
const { PROFILE_IMAGE_PATH, GROUP_LOGO_PATH } = require('@config/storage')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('storage', {
    diskProfileImage: (dataBase64, fileName, imageType = 'png') => {
      const dirpath = path.resolve(PROFILE_IMAGE_PATH)
      const option = { fileName, imageType }
      return base64ToImage(dataBase64, `${dirpath}/`, option)
    },

    removeProfileImage: (fileName) => {
      const dirpath = path.resolve(PROFILE_IMAGE_PATH)
      try {
        fs.unlinkSync(dirpath+'/'+fileName)
      } catch (e) {
        console.log(`Doesn't have image`)
      }
      
    },
    
    getUrlProfileImage: (filename) => filename ? `${fastify.env.APP_URL}/${PROFILE_IMAGE_PATH}/${filename}` : null,
    
    diskGroupLogo: (dataBase64, fileName, imageType = 'png') => {
      const dirpath = path.resolve(GROUP_LOGO_PATH)
      const option = { fileName, imageType }
      return base64ToImage(dataBase64, `${dirpath}/`, option)
    },

    removeGroupLogo: (fileName) => {
      const dirpath = path.resolve(GROUP_LOGO_PATH)
      try {
        fs.unlinkSync(dirpath+'/'+fileName)
      } catch (e) {
        console.log(`Doesn't have image`)
      }
    },
    
    getUrlGroupLogo: (filename) => filename ? `${fastify.env.APP_URL}/${GROUP_LOGO_PATH}/${filename}` : null 
  })
})