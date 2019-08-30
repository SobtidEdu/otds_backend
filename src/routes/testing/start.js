'use strict' 

module.exports = async (fastify, opts) => { 
  fastify.post('start', {}, async (request) => {
    return { message: 'Hello' }
  })
}
