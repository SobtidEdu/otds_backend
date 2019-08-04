'use strict' 

const examCreate = require('./create')

module.exports = async (fastify) => {
  fastify.register(examCreate)
}
