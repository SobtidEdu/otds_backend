'use strict' 

const bcrypt = require('bcrypt')
const _ = require('lodash')
const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  fastify.get('/profile', {
    preValidation: [
      fastify.authenticate()
    ]
  },
  async (request, reply) => {
    const { user } = request
    
    user.profileImage = fastify.storage.getUrlProfileImage(user.profileImage)

    // return user
    return _.pick(user, ['_id', 'prefixName', 'firstName', 'lastName', 'gender', 'department', 'province', 'profileImage', 'email', 'role', 'school'])
  })

  fastify.patch('/profile', {
    preValidation: [
      fastify.authenticate()
    ]
  },
  async (request) => {
    const { user, body } = request
    
    body.school.name.text = _.trimStart(body.school.name.text, 'โรงเรียน')

    _.forIn(body.school, function(value, key) {
      if (value.isModified == true) {
        body.isSeenModified = false
        return 
      }
    })

    if (body.profileImage && body.profileImage.includes('data:image/')) {
      const filename = `profile-${user._id}`
      const imageInfo = fastify.storage.diskProfileImage(body.profileImage, filename)
      
      body.profileImage = imageInfo.fileName
    }

    if (body.password && body.password !== null && body.password !== '') {
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
