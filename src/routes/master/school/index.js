'use strict'
const schema = require('./school.schema')
const csvParser = require('csvtojson')
const _ = require('lodash')
const moment = require('moment')

module.exports = async (fastify, options) => {
  fastify.get('/', {
    schema: schema.list
  }, async (request, reply) => {
    return await fastify.paginate(fastify.mongoose.School, request.query)
  })

  fastify.post('/', async (request, reply) => {
    const school = await fastify.mongoose.School.create(request.body)
    return reply.status(201).send(school)
  })

  fastify.post('/import', async (request, reply) => {
    const { schoolsImportFile } = request.raw.files
    const csvData = schoolsImportFile.data.toString('utf8')
    const schools = await csvParser().fromString(csvData)

    for (let school of schools) {
      const province = await fastify.mongoose.Province.findOne({ name: school['ชื่อจังหวัด*'] })
      if (province) {
        await fastify.mongoose.School.findOneAndUpdate({
          name: school['ชื่อโรงเรียน*']
        }, {
          province: province._id,
          isActive: ['1', ''].includes(school['สถานะ']) ? true : false,
          createdAt: moment().unix(),
          updatedAt: moment().unix(),
        }, { upsert: true })
      } else {
        console.log(`Not found province ${school['ชื่อจังหวัด*']}`)
      }
    }
    return { message: 'นำเข้าไฟล์โรงเรียนเรียบร้อย' }
  })

  fastify.patch('/:_id', async (request, reply) => {
    const { _id } = request.params
    const school = await fastify.mongoose.School.findOneAndUpdate({ _id }, request.body)
    return school
  })

  fastify.delete('/:_id', async (request, reply) => {
    // return reply.status(404).send({ message: 'ไม่พบโรงเรียน' })
    try {
      const { _id } = request.params
      const response = await fastify.mongoose.School.findOneAndDelete({ _id })
      return { message: 'ลบโรงเรียนเรียบร้อย' }
    } catch (e) {
      if (isNotFoundId(e)) {
        return reply.status(404).send({ message: 'ไม่พบโรงเรียน' })
      }
    }
  })
}