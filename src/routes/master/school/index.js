'use strict'

const schoolImport = require('./import')
const schoolList = require('./list')
const schoolDetail = require('./detail')

module.exports = async (fastify, options) => {
  fastify.register(schoolList)
  fastify.register(schoolDetail)
  fastify.register(schoolImport)
}