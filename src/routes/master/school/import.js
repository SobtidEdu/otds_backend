'use strict'

const { ROLE } = require('@config/user.config')
const csvParser = require('csvtojson')
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
    const csvData = schoolsImportFile.data.toString('utf8')
    const schools = await csvParser().fromString(csvData)

    for (let school of schools) {
      const province = await fastify.mongoose.Province.findOne({ name: school['ชื่อจังหวัด*'] })
      const department = await fastify.mongoose.Department.findOne({ seq: school['สังกัดของโรงเรียน'] })
      if (province) {
        await fastify.mongoose.School.findOneAndUpdate({
          name: school['ชื่อโรงเรียน*']
        }, {
          province: province._id,
          addressNo: school['เลขที่'],
          villageNo: school['หมู่ที่'],
          lane: school['ซอย'],
          road: school['ถนน'],
          district: school['อำเภอ'],
          subDistrict: school['ตำบล'],
          postalCode: school['รหัสไปรษณีย์'],
          isActive: ['1', ''].includes(school['สถานะ']) ? true : false,
          department: department ? department.name : '',
          createdAt: moment().unix(),
          updatedAt: moment().unix(),
        }, { upsert: true })
      } else {
        console.log(`Not found province ${school['ชื่อจังหวัด*']}`)
      }
    }
    return { message: 'นำเข้าไฟล์โรงเรียนเรียบร้อย' }
  })
}