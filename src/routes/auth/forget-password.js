'use strict' 

const { ROLE } = require('@config/user')
const bcrypt = require('bcrypt')
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.post('/forget-password/email', async (request) => {
    const { body } = request
    const user = await fastify.mongoose.User.findOne({ email: body.email.toLowerCase() })
    if (!user) throw fastify.httpErrors.badRequest('Not found this email')

    const nextHours = moment().add(1, 'h').unix()
    
    const buff = new Buffer(`${nextHours}.${user.id}`)
    const base64data = buff.toString('base64')

    user.resetPasswordToken = base64data
    await user.save()

    await fastify.nodemailer.sendMail({
      from: fastify.env.EMAIL_FROM,
      to: body.email,
      subject: 'เปลี่ยนรหัสผ่าน OTDS',
      html: await fastify.htmlTemplate.getForgetPasswordTemplate({
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        token: base64data
      })
    })

    return { message: 'sent format password email' }
  })

  fastify.post('/forget-password', async (request) => {
    const { body } = request

    let buff = new Buffer(body.token, 'base64');
    let text = buff.toString('ascii');

    let [expiryUnixtimestamp, userId] = text.split('.')

    const expiry = moment.unix(expiryUnixtimestamp)
    
    if (expiry.diff(moment()) < 0) {
      throw fastify.httpErrors.badRequest('Token has expired')
    }
    const user = await fastify.mongoose.User.findOne({ _id: userId, resetPasswordToken: body.token })
    if (!user) throw fastify.httpErrors.badRequest('Invalid token')

    if (body.password) {
      const salt = 10;
      const hashed = bcrypt.hashSync(body.password, salt)
      body.password = {
        hashed,
        algo: 'bcrypt'
      }
    }

    await fastify.mongoose.User.updateOne({ _id: user._id }, { password: body.password, resetPasswordToken: null })

    return { message: 'password have been changed' }
  })
}