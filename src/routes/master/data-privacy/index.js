'use strict'

module.exports = async (fastify, options) => {
  if (await fastify.mongoose.Notification.countDocuments({ type: 'DATA_PRIVACY' }) == 0) {
    const initialDataPrivacy = require('./initial.json');
    await fastify.mongoose.Notification.create({ type: 'DATA_PRIVACY', data: initialDataPrivacy })
  }

  fastify.register(require('./get'))
  fastify.register(require('./update'))
}