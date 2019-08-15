'use strict'
const _ = require('lodash')
const userList = require('./list')
const userDetail = require('./detail')
const userCreate = require('./create')
const userUpdate = require('./update')
const userDelete = require('./delete')
const userImport = require('./import')

module.exports = async (fastify, options) => {
  fastify.register(userList)
  fastify.register(userDetail)
  fastify.register(userCreate)
  fastify.register(userUpdate)
  fastify.register(userDelete)
  fastify.register(userImport)
}