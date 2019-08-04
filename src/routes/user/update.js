'use strict' 

const bcrypt = require('bcrypt')
const { ROLE } = require('@config/user')
const _ = require('lodash')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/:id', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params, body } = request

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
    
    await fastify.mongoose.User.updateOne({ _id: params.id }, body)
    
    return { message: 'อัพเดตข้อมูลผู้ใช้งานเรียบร้อย'}
  })
}
