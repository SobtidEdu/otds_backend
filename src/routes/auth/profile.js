'use strict' 

const bcrypt = require('bcrypt')
const _ = require('lodash')
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.get('/profile', {
    preValidation: [
      fastify.authenticate()
    ]
  },
  async (request, reply) => {
    const { user } = request
    
    user.profileImage = fastify.storage.getUrlProfileImage(user.profileImage)

    return _.pick(user, ['_id', 'prefixName', 'username', 'firstName', 'lastName', 'gender', 'department', 'province', 'profileImage', 'email', 'role', 'school'])
  })

  fastify.patch('/profile', {
    preValidation: [
      fastify.authenticate()
    ],
    bodyLimit: 5452595 // limit 5.2 mb
  },
  async (request) => {
    const { user, body } = request
    
    if (body.password == null) {
      delete body.password
    }
    if (body.profileImage == null) {
      delete body.profileImage
    }

    if (body.school) {
      body.school.name.text = _.trimStart(body.school.name.text, 'โรงเรียน')

      _.forIn(body.school, function(value, key) {
        if (value.isModified == true) {
          body.isSeenModified = false
          return 
        }
      })
    }
    
    if (body.profileImage && body.profileImage.startsWith('data:image/')) {
      const filename = `profile-${user._id}${moment().unix()}`
      const extension = fastify.utils.getExtensionImage(body.profileImage)
      const imageInfo = fastify.storage.diskProfileImage(body.profileImage, filename, extension)
      
      if (user.profileImage) fastify.storage.removeProfileImage(user.profileImage)

      body.profileImage = imageInfo.fileName
    }

    if (body.password) {
      const isValidCredential = await bcrypt.compareSync(body.password.old, user.password.hashed)
      if (!isValidCredential) {
        throw fastify.httpErrors.badRequest('รหัสผ่านผิดไม่ถูกต้อง')
      }
      const salt = 10;
      const hashed = bcrypt.hashSync(body.password.new, salt)
      body.password = {
        hashed,
        algo: 'bcrypt'
      }
    }
    
    await fastify.mongoose.User.updateOne({ _id: user._id }, body)
    
    return { message: 'อัพเดตข้อมูลส่วนตัวเรียบร้อย'}
  })
}
