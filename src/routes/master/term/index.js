'use strict'

const termUpdate = require('./update')

module.exports = async (fastify, options) => {
  fastify.register(termUpdate)
}