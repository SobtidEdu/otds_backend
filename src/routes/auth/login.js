'use strict' 

const bcrypt = require('bcrypt')
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.post('/login', async (request) => {
    const { email, password } = request.body
    
    let user = await fastify.mongoose.User.findOne({ email })
    if (!user) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')

    const isValidCredential = await bcrypt.compareSync(password, user.password.hashed)
    if (!isValidCredential) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')

    if (!user.isConfirmationEmail) throw fastify.httpErrors.badRequest('กรุณายืนยันการลงทะเบียนทาง Email')

    if (user.isBanned) throw fastify.httpErrors.badRequest('ผู้ใช้บัญชีนี้ถูกระงับการใช้งาน กรุกณาติดต่อผู้ดูแลระบบ')

    const { _id, role, prefixName, firstName, lastName, gender, profileImage, department, school} = user.toObject()

    const [token] = await Promise.all([
      fastify.jwt.sign({ _id }),
      fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: false, lastLoggedInAt: moment().unix() })
    ])

    return { role, prefixName, firstName, lastName, email, gender, department, school, profileImage: fastify.storage.getUrlProfileImage(profileImage), token }
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
