'use strict'
const schema = require('./group.schema')
const uuid = require('uuid')
const { ROLE } = require('../../config')

module.exports = async (fastify, options) => {
  fastify.get('/', {
    preValidation: [
      (request) => fastify.validate(schema.list, request),
      fastify.authenticate
    ]
  }, async (request, reply) => {
    const { user, query } = request;
    if (user.role === ROLE.TEACHER) {
      if (query['filters'] === undefined) query['filters'] = []
      query['filters']['owner'] = user._id
      return await fastify.paginate(fastify.mongoose.Group, query)
    }

    if (user.role === ROLE.STUDENT) {
      if (query['filters'] === undefined) query['filters'] = []
      query['filters']['owner'] = user._id
    }

    
  })

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema.create, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER])
    ],
    bodyLimit: 1248576 // limit 1.2 mb
  }, async (request, reply) => {
    const { user, body } = request
    body.owner = user._id

    if (body.logo) {
      const filename = `group-${uuid()}`
      const imageInfo = fastify.storage.diskGroupLogo(body.logo, filename)
      
      body.logo = imageInfo.fileName
    }

    const group = await fastify.mongoose.Group.create(body)

    await fastify.mongoose.User.update(
      { _id: user._id },
      { $push: { groups: group } }
    )

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

  fastify.delete('/:id', {
    preValidation: [
      (request) => fastify.validate(schema.delete, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER])
    ],
  }, async (request, reply) => {
    const { user, params } = request
    console.log(user)
    const group = await fastify.mongoose.Group.findOne({ _id: params.id })
    
    if (group) {
      await Promise.all([
        fastify.mongoose.Group.findOneAndDelete({_id: group._id }),
        fastify.mongoose.User.update({ _id: user._id }, { $pull: { groups: group._id } })
      ]);
    }

    return { message: `รายการคำนำหน้าถูกลบแล้ว` }
  })
}