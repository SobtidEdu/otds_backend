'use strict'
const bcrypt = require('bcrypt')

module.exports = async (fastify, options) => {
  fastify.post('/register', async (request, response) => {
    const { body } = request
    const salt = 10;

    const hashed = await bcrypt.hashSync(body.password, salt)
    body.password = {
      hashed,
      algo: 'bcrypt'
    }
    
    const html = await fastify.htmlTemplate.getConfirmationRegisterTemplate(body)

    const [user, mailResponse] = await Promise.all([
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