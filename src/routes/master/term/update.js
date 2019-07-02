'use strict'

const { TEMPLATE_HTML_PATH } = require('@config/storage')
const { ROLE } = require('@config/user')
const fs = require('fs')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.patch('/',
  {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { body } = request
    
    fs.writeFileSync(`${TEMPLATE_HTML_PATH}/term.html`, body.text)

    return { message: 'อัพเดตข้อมูลเรียบร้อย' }
  })
}