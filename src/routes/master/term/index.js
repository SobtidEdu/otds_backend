'use strict'

const termUpdate = require('./update')

module.exports = async (fastify, options) => {
  if (await fastify.mongoose.Notification.countDocuments({ type: 'TERM_AND_CONDITION' }) == 0) {
    const initialTerm = require('./initial.json');
    await fastify.mongoose.Notification.create({ type: 'TERM_AND_CONDITION', data: initialTerm })
  }

  fastify.register(require('./get'))
  fastify.register(termUpdate)
}