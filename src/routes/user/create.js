'use strict' 

const bcrypt = require('bcrypt')
const { ROLE } = require('@config/user')
const _ = require('lodash')

module.exports = async (fastify, opts) => { 
  const schema = {
    body: {
      validation: {
        $async: true,
        type: 'object',
        properties: {
          username: { 
            type: 'string',
            isExist: { prop: 'username', collection: 'users' } 
          },
          prefixName: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: [ ROLE.STUDENT, ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN ] },
          email: { 
            type: 'string',
            format: 'email',
            isExist: { prop: 'email', collection: 'users' } 
          }
        },
      },
      message: {
        email: {
          format: 'อีเมลไม่ถูกต้อง',
          isExist: 'อีเมลนี้มีอยู่ในระบบแล้ว'
        },
        username: {
          isExist: 'username นี้มีอยู่ในระบบแล้ว'
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

  fastify.post('/', {
    preValidation: [
      async (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { body } = request

    let user = new fastify.mongoose.User

    if (body.email) {
      body.email = body.email.toLowerCase()
    }

    body.school.name.text = _.trimStart(body.school.name.text, 'โรงเรียน')
    const school = await fastify.mongoose.School.findOne({ name: body.school.name.text })

    body.school = {
      name: {
        text: body.school.name.text,
        isModified: false
      },
      province: {
        id: body.school.province.id,
        isModified: false,
      }
    }

    if (body.role === ROLE.TEACHER) {
      Object.assign(body.school, {
        addressNo: {
          text: school.addressNo,
          isModified: false
        },
        villageNo: {
          text: school.villageNo,
          isModified: false,
        },
        lane: {
          text: school.lane,
          isModified: false,
        },
        road: {
          text: school.road,
          isModified: false,
        },
        district: {
          text: school.district,
          isModified: false,
        },
        subDistrict: {
          text: school.subDistrict,
          isModified: false,
        },
        postalCode: {
          text: school.postalCode,
          isModified: false,
        },
        department: {
          text: school.department,
          isModified: false,
        }
      })
    }

    user.isSeenModified = true
    user.isConfirmationEmail = true

    const salt = 10;
    const hashed = bcrypt.hashSync(body.password, salt)
    body.password = {
      hashed,
      algo: 'bcrypt'
    }
    
    user = Object.assign(user, body)
    
    await user.save()
    
    return { message: 'สร้างบัญชีผู้ใช้เรียบร้อย' }
  })
}
