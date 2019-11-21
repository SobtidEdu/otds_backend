'use strict' 

const { ROLE } = require('@config/user')
const _ = require('lodash')

module.exports = async (fastify, opts) => { 

  fastify.patch('/:userId/check-address', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params } = request
    
    const user = await fastify.mongoose.User.findOne({ _id: params.userId })
    if (!user) throw fastify.httpErrors.notFound(`Not found user id ${params.userId}`)

    _.forIn(user.school.toObject(), (value, key) => {
      user.school[key].isModified = false
    })

    user.isSeenModified = true
    
    await user.save()
    
    return { message: 'อัพเดตข้อมูลผู้ใช้งานเรียบร้อย'}
  })
}
