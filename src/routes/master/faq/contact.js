'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.post('/contact', {
    preValidation: [
      (request) => fastify.validate(schema, request),
    ]
  }, async (request) => {
    const { body } = request
    
    await fastify.nodemailer.sendMail({
      from: fastify.env.EMAIL_FROM,
      to: fastify.env.EMAIL_ADMIN,
      subject: `FAQ คำถามเพิ่มเติม จากคุณ ${body.name}`,
      html: body.message
    })

  })
}