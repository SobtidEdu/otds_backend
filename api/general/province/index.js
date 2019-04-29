'use strict'
const schema = require('./province.schema')
const csvParser = require('csvtojson')

module.exports = async (fastify, options) => {
  fastify.get('/', {
    schema: schema.list
  }, async (request, reply) => {
    return await fastify.paginate(fastify.mongoose.Province, request.query)
  })

  fastify.post('/', {
    schema: schema.create
  }, async (request, reply) => {
    const province = await fastify.mongoose.Province.create(request.body)
    return reply.status(201).send(province)
  })

  fastify.post('/import', {
    schema: schema.import
  }, async (request, reply) => {
    const { provincesFile } = request.raw.files
    const csvData = provincesFile.data.toString('utf8')
    const provinces = await csvParser().fromString(csvData)
    fastify.mongoose.Country.find()
    for (let province of provinces) {
      let value = Object.values(country)
      
      await fastify.mongoose.Country.findOneAndUpdate({
        name: value[0]
      },{
        name: value[0],
        abbr: value[1],
        isActive: value[2] == undefined ? true : (countryValue[3] == 'true' ? true : false),
        createdAt: fastify.moment().unix(),
        updatedAt: fastify.moment().unix(),
      }, { upsert: true })
    }
    return { message: 'Import ไฟล์ประเทศเรียบร้อย' }
  })

  fastify.patch('/', {
    schema: schema.update
  }, async (request, reply) => {
    const result = await fastify.mongoose.Province.create(request.body)
    return { message: `รายการจังหวัดถูกแก้ไขแล้ว ${result.updatedCount} รายการ` }
  })

  fastify.delete('/', {
    schema: schema.delete
  }, async (request, reply) => {
    const result = await fastify.mongoose.Province.remove({_id: { $in: request.query._id }})
    return { message: `รายการจังหวัดถูกลบแล้ว ${result.deletedCount} รายการ` }
  })
}