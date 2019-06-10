'use strict'
const schema = require('./group.schema')
const uuid = require('uuid')
const { ROLE } = require('../../config')

module.exports = async (fastify, options) => {
  fastify.get('/', {
    // preValidation: async (request) => fastify.validate(schema.create, request),
  }, async (request, reply) => {
    return await fastify.paginate(fastify.mongoose.Group, request.query)
  })

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema.create, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER])
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

  fastify.patch('/:groupId', {
    schema: schema.update
  }, async (request, reply) => {
    const { groupId } = request.params
    const result = await fastify.mongoose.Group.findOneAndUpdate({ _id: groupId }, request.body)
    console.log(result)
    return { message: `รายการกลุ่มถูกแก้ไขแล้ว` }
  })

  fastify.delete('/', {
    schema: schema.delete
  }, async (request, reply) => {
    const result = await fastify.mongoose.Group.remove({_id: { $in: request.query._id }})
    return { message: `รายการคำนำหน้าถูกลบแล้ว` }
  })
}