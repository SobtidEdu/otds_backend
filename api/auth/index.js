'use strict'
const bcrypt = require('bcrypt')
const _ = require('lodash')
const schema = require('./auth.schema')
const uuid = require('uuid/v4')

module.exports = async (fastify, options) => {
  fastify.post('/register', {
    preValidation: async (request) => fastify.validate(schema.register, request),
    bodyLimit: 1248576 // limit 1.2 mb
  }, async (request, reply) => {
    const { body } = request

    body.school = { name: _.trimStart(body.school, 'โรงเรียน') }
    const school = await fastify.mongoose.School.findOne({ name: body.school.name })
    if (!school) {
      body.school.type = fastify.config.SCHOOL_TYPE.OTHER
    } else {
      body.school.type = fastify.config.SCHOOL_TYPE.SYSTEM
    }

    if (body.profileImage) {
      const filename = `profile-${uuid()}`
      const imageInfo = fastify.storage.diskProfileImage(body.profileImage, filename)
      
      body.profileImage = imageInfo.fileName
    }

    const salt = 10;
    const hashed = bcrypt.hashSync(body.password, salt)
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
  
    const decode = fastify.jwt.decode(token)
    if (!decode) return fastify.httpErrors.notFound()
    
    const { email } = decode
    let user = await fastify.mongoose.User.findOne({ email })
    if (!user) return fastify.httpErrors.notFound()

    const { _id } = user
    await fastify.mongoose.User.updateOne({ _id}, { isConfirmationEmail: true })

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

    if (!user.isConfirmationEmail) throw fastify.httpErrors.badRequest('กรุณายืนยันการลงทะเบียนทาง Email')

    if (user.isBanned) throw fastify.httpErrors.badRequest('ผู้ใช้บัญชีนี้ถูกระงับการใช้งาน กรุกณาติดต่อผู้ดูแลระบบ')

    const { _id, role, prefixName, firstName, lastName, gender, profileImage } = user.toObject()

    const [token] = await Promise.all([
      fastify.jwt.sign({ _id }),
      fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: false })
    ])

    return { role, prefixName, firstName, lastName, email, gender, profileImage: fastify.storage.getUrlProfileImage(profileImage), token }
  })

  fastify.post('/logout', {
    preValidation: [
      fastify.authenticate
    ]
  },
  async (request, reply) => {
    const { _id } = request.user
    await fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: true })
    return { message: 'ออกจากระบบ'}
  })

  fastify.get('/profile', {
    preValidation: [
      fastify.authenticate
    ]
  },
  async (request, reply) => {
    const { user } = request
    user.profileImage = user.profileImage ? fastify.storage.getUrlProfileImage(user.profileImage) : fastify.storage.getUrlDefaultProfileImage()

    // return user
    return _.pick(user, ['prefixName', 'firstName', 'lastName', 'gender', 'department', 'province', 'profileImage', 'email', 'role', 'school'])
  })

  fastify.patch('/profile', {
    preValidation: [
      fastify.authenticate
    ]
  },
  async (request, reply) => {
    const { _id } = request.user
    await fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: true })
    return { message: 'ออกจากระบบ'}
  })
}