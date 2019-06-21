'use strict'
const schema = require('./prefix.schema')
const csvParser = require('csvtojson')

module.exports = async (fastify, options) => {
  fastify.get('/', {
    schema: schema.list
  }, async (request, reply) => {
    return await fastify.paginate(fastify.mongoose.Prefix, request.query)
  })

  fastify.post('/', {
    schema: schema.create
  }, async (request, reply) => {
    const prefix = await fastify.mongoose.Prefix.create(request.body)
    return reply.status(201).send(prefix)
  })

  // fastify.post('/import', {
  //   schema: schema.import
  // }, async (request, reply) => {
  //   const { provincesImportFile } = request.raw.files
  //   const csvData = provincesImportFile.data.toString('utf8')
  //   const provinces = await csvParser().fromString(csvData)

  //   for (let province of provinces) {
  //     await fastify.mongoose.Province.findOneAndUpdate({
  //       name: province['ชื่อจังหวัด*']
  //     }, {
  //       isActive: ['1', ''].includes(province['สถานะ']) ? true : false,
  //       createdAt: fastify.moment().unix(),
  //       updatedAt: fastify.moment().unix(),
  //     }, { upsert: true })
  //   }
  //   return { message: 'นำเข้าไฟล์จังหวัดเรียบร้อย' }
  // })

  // fastify.patch('/', {
  //   schema: schema.update
  // }, async (request, reply) => {
  //   const result = await fastify.mongoose.Province.create(request.body)
  //   return { message: `รายการจังหวัดถูกแก้ไขแล้ว ${result.updatedCount} รายการ` }
  // })

  fastify.delete('/', {
    schema: schema.delete
  }, async (request, reply) => {
    const result = await fastify.mongoose.Prefix.remove({_id: { $in: request.query._id }})
    return { message: `รายการคำนำหน้าถูกลบแล้ว ${result.deletedCount} รายการ` }
  })
}