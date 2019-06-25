'use strict'

const schema = require('./province.schema')

const provinceList = require('./list')
const provinceCreate = require('./create')
const provinceImport = require('./import')

module.exports = async (fastify, options) => {
  
  fastify.register(provinceList)
  fastify.register(provinceCreate)
  fastify.register(provinceImport)

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