'use strict' 

const bcrypt = require('bcrypt')
const { ROLE } = require('@config/user')
const { TEMP_UPLOAD_PATH } = require('@config/storage')
const readXlsxFile = require('read-excel-file/node')
const _ = require('lodash')
const fs = require('fs')
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/import', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { usersImportFile } = request.raw.files
    const pathFileName = `${TEMP_UPLOAD_PATH}/${usersImportFile.name}`
    
    await usersImportFile.mv(pathFileName, (err) => {
      return new Promise((resolve, reject) => {
        if (err) {
          console.log('error saving')
          reject(err)
        }

        resolve()
      })
    })
    
    const users = await readXlsxFile(fs.createReadStream(pathFileName))
    
    fs.unlinkSync(pathFileName)
    
    const length = users.length

    if (length > 500) { // Over limit upload
      return fastify.httpErrors.badRequest(`upload over limit 500 records`)
    }

    for (let i = 1; i < length; i++) {
      const user = users[i]
      
      if (user[3] && user[4]) {
        if (await fastify.mongoose.User.findOne({ $or: [ {username: user[3]}, {email: user[4]} ] })) return fastify.httpErrors.badRequest(`มีข้อมูลซ้ำในระบบ [${user[3]} หรือ ${user[4]}] แถวที่ ${i+1}`)
      } else if (user[4]) {
        if (await fastify.mongoose.User.findOne({ email: user[4] })) return fastify.httpErrors.badRequest(`มีข้อมูลซ้ำในระบบ [${user[4]}] แถวที่ ${i+1}`)
      } else {
        if (await fastify.mongoose.User.findOne({ username: user[3] })) return fastify.httpErrors.badRequest(`มีข้อมูลซ้ำในระบบ [${user[3]}] แถวที่ ${i+1}`)
      }

      user[5] = _.trimStart(user[5], 'โรงเรียน')

      const school = await fastify.mongoose.School.findOne({ name: user[5] })
      if (!school) return fastify.httpErrors.badRequest(`ไม่พบโรงเรียน '${user[5]}' แถวที่ [${i+1}]`)
      
      let schoolCreate = {
        name: {
          text: user[5],
          isModified: false
        },
        province: {
          id: school.province._id,
          isModified: false,
        }
      }

      if (user[9] === ROLE.TEACHER) {
        Object.assign(school, {
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

      const salt = 10;
      const hashed = bcrypt.hashSync(user[6], salt)
      user[6] = {
        hashed,
        algo: 'bcrypt'
      }

      await fastify.mongoose.User.create({ 
        prefixName: user[0],
        firstName: user[1],
        lastName: user[2],
        username: user[3],
        email: user[4],
        password: user[6],
        role: user[7],
        school: schoolCreate,
        isActive: true,
        isConfirmationEmail: true,
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
      })
    }

    return { message: 'นำเข้าไฟล์ผู้ใช้เรียบร้อย' }
  })
}


