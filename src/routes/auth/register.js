'use strict' 

const _ = require('lodash')

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

    fastify.get('/register',
    {
      preValidation: async (request) => fastify.validate(schema, request),
      bodyLimit: 2248576 // limit 2.2 mb
    }, async (request) => {
      const { body } = request

      let user = new fastify.mongoose.User

      body.email = body.email.toLowerCase()
      body.school = { name: { text: _.trimStart(body.school.name.text, 'โรงเรียน') } }

      for ( schoolProp of body.school ) {
        if (schoolProp.isModified == true) {
          user.isSeenModified = false
          break;
        }
      }

      if (body.profileImage) {
        const filename = `profile-${user._id}`
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
        user.save(),
        fastify.nodemailer.sendMail({
          from: fastify.env.EMAIL_FROM,
          to: body.email,
          subject: 'ยืนยันการลงทะเบียน OTDS',
          html
        })
      ])
      
      return { message: 'กรุณาเช็คกล่อง email และยืนยันการลงทะเบียน' }
    })
  
}
