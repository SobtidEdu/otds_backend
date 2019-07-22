'use strict'
const _ = require('lodash')
const authRegister = require('./register')
const authLogin = require('./login')

module.exports = async (fastify, options) => {

  fastify.register(authRegister)
  fastify.register(authLogin)

  fastify.get('/profile', {
    preValidation: [
      fastify.authenticate()
    ]
  },
  async (request, reply) => {
    const { user } = request
    user.profileImage = fastify.storage.getUrlProfileImage(user.profileImage)

    console.log(user)

    // return user
    return _.pick(user, ['_id', 'prefixName', 'firstName', 'lastName', 'gender', 'department', 'province', 'profileImage', 'email', 'role', 'school'])
  })

  fastify.patch('/profile', {
    preValidation: [
      fastify.authenticate()
    ]
  },
  async (request, reply) => {
    const { _id } = request.user
    await fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: true })
    return { message: 'ออกจากระบบ'}
  })
}