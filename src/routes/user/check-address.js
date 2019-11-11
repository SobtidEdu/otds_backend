'use strict' 

const bcrypt = require('bcrypt')
const { ROLE } = require('@config/user')
const _ = require('lodash')
const moment = require('moment')

module.exports = async (fastify, opts) => { 

  fastify.patch('/:userId', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params, body } = request
    const user = await fastify.mongoose.User.findOne({ _id: params.userId })
    
    _.forIn(user.school, (value, key) => {
      user.school[key].isSeenModified = true
    })
    
    await user.save()
    
    return { message: 'อัพเดตข้อมูลผู้ใช้งานเรียบร้อย'}
  })
}
