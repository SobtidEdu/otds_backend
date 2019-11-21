'use strict' 

const { ROLE } = require('@config/user')
const bcrypt = require('bcrypt')
const md5 = require('md5')
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.post('/login', async (request) => {
    let { email, password } = request.body
    
    email = email.toLowerCase()

    let user
    if (email.indexOf('@') !== -1) {
      user = await fastify.mongoose.User.findOne({ email })
    } else {
      user = await fastify.mongoose.User.findOne({ username: email })
    }
    if (!user) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')

    let isValidCredential = false
    if (user.password.algo === 'bcrypt') {
      isValidCredential = await bcrypt.compareSync(password, user.password.hashed)
    } else if (user.password.algo === 'md5') {
      const [ hashed, salt ] = user.password.hashed.split(':')
      isValidCredential = hashed === md5(password+salt)
    }

    if (!isValidCredential) throw fastify.httpErrors.badRequest('อีเมลหรือรหัสผ่านผิดพลาด')
    
    if (!user.isConfirmationEmail && user.role === ROLE.TEACHER) throw fastify.httpErrors.badRequest('กรุณายืนยันการลงทะเบียนทาง Email')

    if (user.isBanned) throw fastify.httpErrors.badRequest('ผู้ใช้บัญชีนี้ถูกระงับการใช้งาน กรุกณาติดต่อผู้ดูแลระบบ')

    const { _id, role, username, prefixName, firstName, lastName, profileImage, notices, oldSystemId, isSeenTutorial, isSeenTermAndCondition } = user.toObject()

    const date = new Date()

    const [token] = await Promise.all([
      fastify.jwt.sign({ _id }),
      fastify.mongoose.User.updateOne({ _id }, { isLoggedOut: false, lastLoggedInAt: moment().unix() }),
      fastify.mongoose.LoginStat.update({ day: date.getDate(), month: date.getMonth()+1, year: date.getFullYear() }, { $push: { users: { _id: user._id, role } } }, { upsert: true })
    ])

    return { _id, role, username, prefixName, firstName, lastName, profileImage: fastify.storage.getUrlProfileImage(profileImage), email, token, notices, oldSystemId, isSeenTutorial, isSeenTermAndCondition }
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
