'use strict' 

const bcrypt = require('bcrypt')
const { ROLE } = require('@config/user')
const _ = require('lodash')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.patch('/:userId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params, body } = request
    const user = await fastify.mongoose.User.findOne({ _id: params.userId })
    if (body.school) {
      body.school.name.text = _.trimStart(body.school.name.text, 'โรงเรียน')

      _.forIn(body.school, (value, key) => {
        if (value.isModified == true) {
          body.isSeenModified = false
          return 
        }
      })
    }

    if (body.profileImage && body.profileImage.includes('data:image/')) {
      const filename = `profile-${params.userId}`
      const extension = fastify.utils.getExtensionImage(body.profileImage)
      const imageInfo = fastify.storage.diskProfileImage(body.profileImage, filename)
      
      if (user.profileImage) fastify.storage.removeProfileImage(user.profileImage)

      body.profileImage = imageInfo.fileName
    } else {
      delete body.profileImage
    }

    if (body.password) {
      const salt = 10;
      const hashed = bcrypt.hashSync(body.password.new, salt)
      body.password = {
        hashed,
        algo: 'bcrypt'
      }
    } else {
      delete body.password
    }
    
    await fastify.mongoose.User.updateOne({ _id: params.userId }, body)
    
    return { message: 'อัพเดตข้อมูลผู้ใช้งานเรียบร้อย'}
  })
}
