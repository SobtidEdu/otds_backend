'use strict'

const { ROLE } = require('@config/user')
const { TEMP_UPLOAD_PATH } = require('@config/storage')
const readXlsxFile = require('read-excel-file/node')
const fs = require('fs')
const moment = require('moment')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.post('/import', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  },
  async (request) => {
    const { schoolsImportFile } = request.raw.files
    const pathFileName = `${TEMP_UPLOAD_PATH}/${schoolsImportFile.name}`
    await schoolsImportFile.mv(pathFileName, (err) => {
      return new Promise((resolve, reject) => {
        if (err) {
          console.log('error saving')
          reject(err)
        }

        resolve()
      })
    })
    
    const schools = await readXlsxFile(fs.createReadStream(pathFileName))
    
    fs.unlinkSync(pathFileName)
    
    const length = schools.length

    for (let i = 1; i < length; i++) {
      const school = schools[i]
      const province = await fastify.mongoose.Province.findOne({ name: school[7] })
      const department = await fastify.mongoose.Department.findOne({ code: school[9] })
      if (province) {
        await fastify.mongoose.School.findOneAndUpdate({
          name: school[0]
        }, {
          province: province._id,
          addressNo: school[1],
          villageNo: school[2],
          lane: school[3],
          road: school[4],
          district: school[5],
          subDistrict: school[6],
          postalCode: school[8],
          isActive: ['1', ''].includes(school[10]) ? true : false,
          department: department ? department.name : '',
          remark: school[11],
          createdAt: moment().unix(),
          updatedAt: moment().unix(),
        }, { upsert: true })
      } else {
        throw fastify.httpErrors.badRequest(`Not found province name ${school[7]}`);
      }
    }

    return { message: 'นำเข้าไฟล์โรงเรียนเรียบร้อย' }
  })
}