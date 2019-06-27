'use strict'

const schoolImport = require('./import')
const schoolList = require('./list')
const schoolDetail = require('./detail')

module.exports = async (fastify, options) => {
  fastify.register(schoolList)
  fastify.register(schoolDetail)

  // fastify.post('/', async (request, reply) => {
  //   const school = await fastify.mongoose.School.create(request.body)
  //   return reply.status(201).send(school)
  // })

  fastify.register(schoolImport)

  // fastify.patch('/:_id', async (request, reply) => {
  //   const { _id } = request.params
  //   const school = await fastify.mongoose.School.findOneAndUpdate({ _id }, request.body)
  //   return school
  // })

  // fastify.delete('/:_id', async (request, reply) => {
  //   // return reply.status(404).send({ message: 'ไม่พบโรงเรียน' })
  //   try {
  //     const { _id } = request.params
  //     const response = await fastify.mongoose.School.findOneAndDelete({ _id })
  //     return { message: 'ลบโรงเรียนเรียบร้อย' }
  //   } catch (e) {
  //     if (isNotFoundId(e)) {
  //       return reply.status(404).send({ message: 'ไม่พบโรงเรียน' })
  //     }
  //   }
  // })
}