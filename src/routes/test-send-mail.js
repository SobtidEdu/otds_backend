'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.get('/send-mail', {
    preValidation: [
      (request) => fastify.validate(schema, request),
    ]
  }, async (request) => {
    const { body } = request
    
    await fastify.nodemailer.sendMail({
      from: fastify.env.EMAIL_FROM,
      to: 'nuttasak@sobtid.me',
      subject: `ทดสอบส่ง EMAIL จาก OTDS`,
      html: `<div><p>Test</p></div>`
    })
    return { message: 'Sent infomation success!' }
  })
}