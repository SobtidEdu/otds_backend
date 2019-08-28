'use strict' 

const bcrypt = require('bcrypt')
const _ = require('lodash')
const { ROLE } = require('@config/user')
const randomEmail = require('random-email')

module.exports = async (fastify, opts) => { 
  const schema = {
    body: {
      validation: {
        $async: true,
        type: 'object',
        properties: {
          prefixName: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: [ ROLE.STUDENT, ROLE.TEACHER ] },
          email: { 
            type: 'string',
            format: 'email',
            isExist: { prop: 'email', collection: 'users' } 
          }
        },
        required: ['email', 'password'],
      },
      message: {
        email: {
          required: 'กรุณากรอกอีเมล',
          format: 'อีเมลไม่ถูกต้อง',
          isExist: 'อีเมลนี้มีอยู่ในระบบแล้ว'
        },
        password: {
          required: 'กรุณากรอกรหัสผ่าน'
        },
        role: {
          enum: 'กรุณาระบุ Role ให้ถูกต้อง'
        },
        gender: {
          enum: 'กรุณาระบุเพศให้ถูกต้อง'
        }
      }
    }
  }

  fastify.post('/register',
  {
    preValidation: async (request) => fastify.validate(schema, request),
    bodyLimit: 5452595 // limit 5.2 mb
  }, async (request) => {
    const { body } = request

    let user = new fastify.mongoose.User

    
    body.email = body.email.toLowerCase()
    body.school.name.text = _.trimStart(body.school.name.text, 'โรงเรียน')

    _.forIn(body.school, function(value, key) {
      if (value.isModified == true) {
        user.isSeenModified = false
        return 
      }
    })

    if (body.profileImage && body.profileImage.startsWith('data:image/')) {
      const filename = `profile-${user._id}`
      const extension = fastify.utils.getExtensionImage(body.profileImage)
      const imageInfo = fastify.storage.diskProfileImage(body.profileImage, filename, extension)
      
      body.profileImage = imageInfo.fileName
    }

    const salt = 10;
    const hashed = bcrypt.hashSync(body.password, salt)
    body.password = {
      hashed,
      algo: 'bcrypt'
    }

    // const html = await fastify.htmlTemplate.getConfirmationRegisterTemplate(body)

    // user = Object.assign(user, body)
    
    await Promise.all([
      user.save(),
      // fastify.nodemailer.sendMail({
      //   from: fastify.env.EMAIL_FROM,
      //   to: body.email,
      //   subject: 'ยืนยันการลงทะเบียน OTDS',
      //   html
      // })
    ])
    
    return { message: 'กรุณาเช็คกล่อง email และยืนยันการลงทะเบียน' }
  })


  fastify.post('/register-test', {

  }, async (request) => {
    const { body } = request

    let user = new fastify.mongoose.User

    body.email = randomEmail()
    body.school.name.text = _.trimStart(body.school.name.text, 'โรงเรียน')

    _.forIn(body.school, function(value, key) {
      if (value.isModified == true) {
        user.isSeenModified = false
        return 
      }
    })

    const salt = 10;
    const hashed = bcrypt.hashSync(body.password, salt)
    body.password = {
      hashed,
      algo: 'bcrypt'
    }
    
    user = Object.assign(user, body)

    await user.save()
    
    return { message: 'กรุณาเช็คกล่อง email และยืนยันการลงทะเบียน' }
  })


  fastify.post('/confirm-email', async (request, reply) => {
    const { token } = request.body
  
    const decode = fastify.jwt.decode(token)
    if (!decode) return fastify.httpErrors.notFound()
    
    const { email } = decode
    let user = await fastify.mongoose.User.findOne({ email })
    if (!user) return fastify.httpErrors.notFound()

    await fastify.mongoose.User.updateOne({ _id: user._id}, { isConfirmationEmail: true })

    return { message: 'Confirm email success' }
  })
}
