'use strict'

const schema = require('./province.schema')

const provinceList = require('./list')
const provinceImport = require('./import')

module.exports = async (fastify, options) => {
  
  fastify.register(provinceList)
  fastify.register(require('./create'))
  fastify.register(require('./update'))
  fastify.register(require('./remove'))
  fastify.register(provinceImport)
}