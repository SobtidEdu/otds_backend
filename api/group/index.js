'use strict'
const schema = require('./group.schema')
const uuid = require('uuid')

module.exports = async (fastify, options) => {
  fastify.get('/', {
    // preValidation: async (request) => fastify.validate(schema.create, request),
  }, async (request, reply) => {
    return await fastify.paginate(fastify.mongoose.Prefix, request.query)
  })

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema.create, request),
      fastify.auth([fastify.verifyUser]),
    ],
    bodyLimit: 1248576 // limit 1.2 mb
  }, async (request, reply) => {
    const { body } = request
    body.owner = request.user._id

    if (body.logo) {
      const filename = `group-${uuid()}`
      const imageInfo = fastify.storage.diskGroupLogo(body.logo, filename)
      
      body.logo = imageInfo.fileName
    }

    const group = await fastify.mongoose.Group.create(body)

    return reply.status(201).send({
      message: 'สร้างกลุ่มสำเร็จ',
      group
    })
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

  fastify.patch('/:groupId', {
    schema: schema.update
  }, async (request, reply) => {
    const result = await fastify.mongoose.Province.create(request.body)
    return { message: `รายการจังหวัดถูกแก้ไขแล้ว ${result.updatedCount} รายการ` }
  })

  fastify.delete('/', {
    schema: schema.delete
  }, async (request, reply) => {
    const result = await fastify.mongoose.Prefix.remove({_id: { $in: request.query._id }})
    return { message: `รายการคำนำหน้าถูกลบแล้ว ${result.deletedCount} รายการ` }
  })
}