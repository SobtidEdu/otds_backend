'use strict' 

const bcrypt = require('bcrypt')
const { ROLE } = require('@config/user')
const _ = require('lodash')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { body } = request

    let user = new fastify.mongoose.User

    if (body.email) {
      body.email = body.email.toLowerCase()
    }

    if (body.username && body.email) {
      if (await fastify.mongoose.User.findOne({ $or: [ {username: body.username}, {email: body.email} ] })) return fastify.httpErrors.badRequest('Username or email has been duplicated')
    }
    else if (body.email) {
      if (await fastify.mongoose.User.findOne({ email: body.email })) return fastify.httpErrors.badRequest('Username or email has been duplicated')
    } else {
      if (await fastify.mongoose.User.findOne({ username: body.username })) return fastify.httpErrors.badRequest('Username or email has been duplicated')
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

    if (body.role === ROLE.STUDENT) {
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
