'use strict'
const _ = require('lodash')
const authRegister = require('./register')
const authLogin = require('./login')
const profile = require('./profile')

module.exports = async (fastify, options) => {
  fastify.register(authRegister)
  fastify.register(authLogin)
  fastify.register(profile)
  fastify.register(require('./forget-password'))
}