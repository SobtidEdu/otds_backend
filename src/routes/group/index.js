'use strict'
const schema = require('./group.schema')
const uuid = require('uuid')
const { ROLE } = require('@root/config')

module.exports = async (fastify, options) => {
  fastify.get('/', {
    preValidation: [
      (request) => fastify.validate(schema.list, request),
      fastify.authenticate
    ]
  }, async (request, reply) => {

    const { user, query } = request;

    let baseOptions = []

    if (user.role === ROLE.STUDENT) {
      baseOptions = [
        { $match: { 'students.inGroup.userInfo': user._id   } },
        { 
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        { $unwind: "$owner" },
        {
          $project: { 
            _id: 1,
            name: 1,
            code: 1,
            logo: 1,
            ownerName: { $concat: [ "$owner.firstName", " ", "$owner.lastName"] }, 
            createdAt: 1
          }
        }
      ]
      const results = await fastify.paginate(fastify.mongoose.Group, baseOptions, query)
      return results
    } else {
      baseOptions = [
        { $match: { owner: user._id} },
        {
          $project: { 
            _id: 1,
            name: 1,
            studentCount: { $size: "$students.inGroup" },
            logo: 1,
            createdAt: 1
          }
        }
      ]
      return await fastify.paginate(fastify.mongoose.Group, baseOptions, query)
    }
  })

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema.create, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER])
    ],
    bodyLimit: 2200000 // limit 2.2 mb
  }, async (request, reply) => {
    const { user, body } = request

    let group = new fastify.mongoose.Group({ owner: user._id, name: body.name })

    if (body.logo) {
      const filename = `group-${group._id}`
      const imageInfo = fastify.storage.diskGroupLogo(body.logo, filename)
      
      group.logo = imageInfo.fileName
    }

    await Promise.all([
      group.save(),
      fastify.mongoose.User.update(
        { _id: user._id },
        { $push: { groups: { info: group, status: 'owner' } } }
      )
    ])

    return reply.status(201).send({
      message: fastify.message('group.created'),
      group
    })
  })

  fastify.patch('/:groupId', {
    schema: schema.update
  }, async (request, reply) => {
    
    const { body, params } = request.params
    
    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId })
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    if (body.logo && body.logo.include('data:image/')) {
      const filename = `group-${group._id}`
      const imageInfo = fastify.storage.diskGroupLogo(body.logo, filename)
      
      body.logo = imageInfo.fileName
    }
    
    const result = await fastify.mongoose.Group.findOneAndUpdate({ _id: params.groupId }, body)
    
    return { message: fastify.message('group.updated') }
  })

  fastify.delete('/:id', {
    preValidation: [
      (request) => fastify.validate(schema.delete, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER])
    ],
  }, async (request, reply) => {
    const { user, params } = request
    
    const group = await fastify.mongoose.Group.findOne({ _id: params.id })
    
    if (group) {
      await Promise.all([
        fastify.mongoose.Group.findOneAndDelete({_id: group._id }),
        fastify.mongoose.User.update({ _id: user._id }, { $pull: { groups: group._id } })
      ]);
    }

    return { message: fastify.message('group.deleted') }
  })

  fastify.register(require('./student'))
  // fastify.register(require('./student'))
}