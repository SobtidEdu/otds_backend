'use strict'
const schema = require('./prefix.schema')

const prefixList = require('./list')

module.exports = async (fastify, options) => {

  if (await fastify.mongoose.Prefix.countDocuments() == 0) {
    const initialPrefixs = require('./initial.json');
    await fastify.mongoose.Prefix.create({data:  initialPrefixs })
  }

  fastify.register(prefixList)
  fastify.register(require('./create'))
  fastify.register(require('./update'))

  
}