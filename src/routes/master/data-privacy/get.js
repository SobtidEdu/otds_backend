'use strict'

const { TEMPLATE_HTML_PATH } = require('@config/storage')
const { ROLE } = require('@config/user')
const fs = require('fs')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.get('/',
  {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ]
  }, async (request) => {
    
    const { data } = await fastify.mongoose.Notification.findOne({ type: 'DATA_PRIVACY' })

    return data
  })
}