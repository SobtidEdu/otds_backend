'use strict' 

const bcrypt = require('bcrypt')
const { ROLE } = require('@config/user')
const _ = require('lodash')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { body } = request

    let user = new fastify.mongoose.User

    body.email = body.email.toLowerCase()
    body.school.name.text = _.trimStart(body.school.name.text, 'โรงเรียน')

    _.forIn(body.school, function(value, key) {
      if (value.isModified == true) {
        user.isSeenModified = false
        return 
      }
    })

    if (body.profileImage) {
      const filename = `profile-${user._id}`
      const imageInfo = fastify.storage.diskProfileImage(body.profileImage, filename)
      
      body.profileImage = imageInfo.fileName
    }

    const salt = 10;
    const hashed = bcrypt.hashSync(body.password, salt)
    body.password = {
      hashed,
      algo: 'bcrypt'
    }
    
    user = Object.assign(user, body)
    
    await user.save()
    
    return { message: 'สร้างบัญชีผู้ใช้เรียบร้อย' }
  })
}
