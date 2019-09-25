'use strict' 

const { ROLE } = require('@config/user')
const bcrypt = require('bcrypt')
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.post('/login', async (request) => {
    const { email, password } = request.body

    let user
    if (email.indexOf('@') !== -1) {
      user = await fastify.mongoose.User.findOne({ email })
    } else {
      user = await fastify.mongoose.User.findOne({ username: email })
    }
    if (!user) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')

    const isValidCredential = await bcrypt.compareSync(password, user.password.hashed)
    if (!isValidCredential) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')

    if (!user.isConfirmationEmail && user.role === ROLE.TEACHER) throw fastify.httpErrors.badRequest('กรุณายืนยันการลงทะเบียนทาง Email')

    if (user.isBanned) throw fastify.httpErrors.badRequest('ผู้ใช้บัญชีนี้ถูกระงับการใช้งาน กรุกณาติดต่อผู้ดูแลระบบ')

    const { _id, role, prefixName, firstName, lastName, profileImage, email } = user.toObject()

    const [token] = await Promise.all([
      fastify.jwt.sign({ _id }),
      fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: false, lastLoggedInAt: moment().unix() })
    ])

    return { role, prefixName, firstName, lastName, profileImage: fastify.storage.getUrlProfileImage(profileImage), email, token }
  })

  fastify.post('/logout', {
    preValidation: [
      fastify.authenticate()
    ]
  }, async (request) => {
    const { _id } = request.user
    await fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: true })
    return { message: 'ออกจากระบบ'}
  })
}
