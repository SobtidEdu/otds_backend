'use strict'
const _ = require('lodash')
const userList = require('./list')

module.exports = async (fastify, options) => {

  fastify.register(userList)
}