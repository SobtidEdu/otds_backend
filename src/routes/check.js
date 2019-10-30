'use strict'
module.exports = async (fastify, options) => {
  fastify.get('/is-email-exist/:email', async (request, reply) => {
    const { email } = request.params

    const count = await fastify.mongoose.User.count({ email: email.toLowerCase() })
    let result = false
    
    if (count > 0) {
      result = true
    }
    
    return { result }
  })

  fastify.get('/is-username-exist/:username', async (request, reply) => {
    const { username } = request.params

    const count = await fastify.mongoose.User.count({ username: username })
    let result = false
    
    if (count > 0) {
      result = true
    }
    
    return { result }
  })
}