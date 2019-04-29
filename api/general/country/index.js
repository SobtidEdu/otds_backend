'use strict'
const schema = require('./country.schema')
const csvParser = require('csvtojson')

module.exports = async (fastify, options) => {
  fastify.get('/', {
    schema: schema.list
  }, async (request, reply) => {
    return await fastify.paginate(fastify.mongoose.Country, request.query)
  })

  fastify.post('/', {
    schema: schema.create
  }, async (request, reply) => {
    const country = await fastify.mongoose.Country.create(request.body)
    return reply.status(201).send(country)
  })

  fastify.post('/import', {
    schema: schema.import
  }, async (request, reply) => {
    const { countriesFile } = request.raw.files
    const csvData = countriesFile.data.toString('utf8')
    const countries = await csvParser().fromString(csvData)
    for (let country of countries) {
      let countryValue = Object.values(country)
      await fastify.mongoose.Country.findOneAndUpdate({
        abbr: countryValue[2]
      },{
        name: {
          th: countryValue[0],
          en: countryValue[1]
        },
        abbr: countryValue[2],
        createdAt: fastify.moment().unix(),
        updatedAt: fastify.moment().unix(),
        isActive: countryValue[3] == undefined ? true : (countryValue[3] == 'true' ? true : false),
      }, { upsert: true })
    }
    return { message: 'Import ไฟล์ประเทศเรียบร้อย' }
  })

  fastify.patch('/', {
    schema: schema.update
  }, async (request, reply) => {
    const result = await fastify.mongoose.Country.update({ _id: { $in: request.query._id } }, request.body)
    return { message: `รายการจังหวัดถูกแก้ไขแล้ว ${result.nModified} รายการ` }

  })

  fastify.delete('/', {
    schema: schema.delete
  }, async (request, reply) => {
    const result = await fastify.mongoose.Country.remove({_id: { $in: request.query._id }})
    return { message: `รายการจังหวัดถูกลบแล้ว ${result.deletedCount} รายการ` }
  })
}