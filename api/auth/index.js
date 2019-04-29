'use strict'

module.exports = async (fastify, options) => {
  fastify.post('/register', async (request, response) => {
    return { "HEllo": "Is me"}
  })
  fastify.post('/login', async (request, response) => {
    
  })
  fastify.post('/logout', async (request, response) => {
    
  })
}