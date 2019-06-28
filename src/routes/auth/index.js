'use strict'
const bcrypt = require('bcrypt')
const _ = require('lodash')
const schema = require('./auth.schema')
const authRegister = require('./register')

module.exports = async (fastify, options) => {

  fastify.register(authRegister)

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
    
    let user = await fastify.mongoose.User.findOne({ email }).populate({ path: 'province', model: fastify.mongoose.Province, select: 'name' })
    console.log(user.provinces)
    if (!user) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')

    const isValidCredential = await bcrypt.compareSync(password, user.password.hashed)
    if (!isValidCredential) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')

    if (!user.isConfirmationEmail) throw fastify.httpErrors.badRequest('กรุณายืนยันการลงทะเบียนทาง Email')

    if (user.isBanned) throw fastify.httpErrors.badRequest('ผู้ใช้บัญชีนี้ถูกระงับการใช้งาน กรุกณาติดต่อผู้ดูแลระบบ')

    const { _id, role, prefixName, firstName, lastName, gender, profileImage, department, school, province } = user.toObject()

    const [token] = await Promise.all([
      fastify.jwt.sign({ _id }),
      fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: false })
    ])

    return { role, prefixName, firstName, lastName, email, gender, department, school, province, profileImage: fastify.storage.getUrlProfileImage(profileImage), token }
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
    return _.pick(user, ['_id', 'prefixName', 'firstName', 'lastName', 'gender', 'department', 'province', 'profileImage', 'email', 'role', 'school'])
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