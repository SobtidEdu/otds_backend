'use strict'
module.exports = async (fastify, options) => {
  fastify.get('/delete/:email', async (request, reply) => {
    const { email } = request.params
    await fastify.mongoose.User.findOneAndDelete({ email })

    return { message: 'delete already' }
  })
}