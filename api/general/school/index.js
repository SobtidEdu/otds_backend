'use strict'
const schema = require('./school.schema')
const csvParser = require('csvtojson')

module.exports = async (fastify, options) => {
  fastify.get('/', {
    schema: schema.list
  }, async (request, reply) => {
    return await fastify.paginate(fastify.mongoose.School, request.query)
  })

  fastify.post('/', async (request, response) => {
    const school = await fastify.mongoose.School.create(request.body)
    return reply.status(201).send(school)
  })

  fastify.post('/import', async (request, response) => {
    const { provincesFile } = request.raw.files
    const csvData = provincesFile.data.toString('utf8')
    const countries = await csvParser().fromString(csvData)
    for (let country of countries) {
      let value = Object.values(country)
      await fastify.mongoose.Country.findOneAndUpdate({
        name: value[0]
      },{
        name: value[0],
        isActive: value[3] == undefined ? true : (countryValue[3] == 'true' ? true : false),
        createdAt: fastify.moment().unix(),
        updatedAt: fastify.moment().unix(),
      }, { upsert: true })
    }
    return { message: 'Import ไฟล์ประเทศเรียบร้อย' }
  })

  fastify.patch('/:id', async (request, response) => {
    
  })

  fastify.delete('/', async (request, response) => {
    
  })
}