'use strict'
const bcrypt = require('bcrypt')
const _ = require('lodash')
const schema = require('./auth.schema')
const base64ToImage = require('base64-to-image')
const uuid = require('uuid/v4')

module.exports = async (fastify, options) => {
  fastify.post('/register', {
    preValidation: async (request) => fastify.validate(schema.register, request),
    bodyLimit: 1248576 // limit 1.2 mb
  }, async (request, response) => {
    const { body } = request

    body.school = { name: _.trimStart(body.school, 'โรงเรียน') }
    const school = await fastify.mongoose.School.findOne({ name: body.school })
    if (!school) {
      body.school.type = fastify.config.SCHOOL_TYPE.SYSTEM
    } else {
      body.school.type = fastify.config.SCHOOL_TYPE.OTHER
    }

    const path = `profile-${uuid()}`
    base64ToImage(body.profileImage, fastify.config.prof)
    
    const salt = 10;
    const hashed = await bcrypt.hashSync(body.password, salt)
    body.password = {
      hashed,
      algo: 'bcrypt'
    }
    
    const html = await fastify.htmlTemplate.getConfirmationRegisterTemplate(body)

    await Promise.all([
      fastify.mongoose.User.create(request.body),
      fastify.nodemailer.sendMail({
        from: fastify.env.EMAIL_FROM,
        to: body.email,
        subject: 'ยืนยันการลงทะเบียน OTDS',
        html
      })
    ])
    
    return { message: 'กรุณาเช็คกล่อง email และยืนยันการลงทะเบียน' }
  })

  fastify.get('/confirm-email/:token', async (request, reply) => {
    const { token } = request.params
    
    const { email } = fastify.jwt.decode(token)
    
    let user = await fastify.mongoose.User.findOne({ email })
    
    user.isConfirmationEmail = true;

    return reply.redirect(fastify.env.CONFIRMED_EMAIL_LINK)
  })

  fastify.get('/confirmed', async (request, reply) => {
    return reply.send('ยืนยันอีเมลเรียบร้อย')
  })

  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body
    
    let user = await fastify.mongoose.User.findOne({ email })
    if (!user) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')

    const isValidCredential = await bcrypt.compareSync(password, user.password.hashed)
    if (!isValidCredential) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')

    if (user.isBanned) throw fastify.httpErrors.badRequest('ผู้ใช้บัญชีนี้ถูกระงับการใช้งาน กรุกณาติดต่อผู้ดูแลระบบ')

    const { _id, role, prefixName, firstName, lastName } = user.toObject()

    const [token] = await Promise.all([
      fastify.jwt.sign({ _id }),
      fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: false })
    ])

    return { role, prefixName, firstName, lastName, email, token }
  })

  fastify.post('/logout', {
    preValidation: fastify.auth([
      fastify.verifyUser
    ])
  },
  async (request, reply) => {
    const { _id } = request.user
    await fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: true })
    return { message: 'ออกจากระบบ'}
  })
}