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
    const { provincesImportFile } = request.raw.files
    const csvData = provincesImportFile.data.toString('utf8')
    const provinces = await csvParser().fromString(csvData)

    for (let province of provinces) {
      await fastify.mongoose.Province.findOneAndUpdate({
        name: province['ชื่อจังหวัด*']
      }, {
        isActive: ['1', ''].includes(province['สถานะ']) ? true : false,
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
      }, { upsert: true })
    }
    return { message: 'นำเข้าไฟล์จังหวัดเรียบร้อย' }
  })
}