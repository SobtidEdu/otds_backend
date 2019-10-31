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
    const { provincesImportFile } = request.raw.files
    const pathFileName = `${TEMP_UPLOAD_PATH}/${provincesImportFile.name}`
    await provincesImportFile.mv(pathFileName, (err) => {
      return new Promise((resolve, reject) => {
        if (err) {
          console.log('error saving')
          reject(err)
        }

        resolve()
      })
    })
    
    const provinces = await readXlsxFile(fs.createReadStream(pathFileName))
    
    fs.unlinkSync(pathFileName)
    
    const length = provinces.length

    for (let i = 1; i < length; i++) {
      const province = provinces[i]

      if (!['ใต้', 'กลาง', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันตก', 'เหนือ'].includes(province[1])) return fastify.httpErrors.badRequest(`ภูมิภาคไม่ถูกต้อง '${province[1]}' แถวที่ [${i}]`)

      await fastify.mongoose.Province.findOneAndUpdate({
        name: province[0]
      }, {
        region: province[1],
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
      }, { upsert: true })
    }

    return { message: 'นำเข้าไฟล์จังหวัดเรียบร้อย' }
  })
}