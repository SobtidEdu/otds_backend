'use strict'

module.exports = async (fastify, options) => {
  if (await fastify.mongoose.Notification.countDocuments({ type: 'NOTICE' }) == 0) {
    await fastify.mongoose.Notification.create({ type: 'NOTICE', data: [
      { id: 1, text: '', times: '', isBroadcast: false },
      { id: 2, text: '', times: '', isBroadcast: false },
      { id: 3, text: '', times: '', isBroadcast: false }
    ] })
  }

  fastify.register(require('./list'))
  fastify.register(require('./update'))
}