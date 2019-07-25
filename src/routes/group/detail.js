'use strict'

const { ROLE } = require('@root/config')

module.exports = async (fastify, options) => {

  const schema = {}

  fastify.get('/:id', {
    preValidation: [
      (request) => fastify.validate(schema.create, request),
      fastify.authenticate()
    ]
  }, async (request, reply) => {
    const { user, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.id })

    const myGroup = user.groups.toObject().find(myGroup => myGroup.info.toString() === group._id.toString())

    const groupDetail = { 
      name: group.name,
      code: group.code,
      studentCount: group.students.inGroup.length,
      createdAt: group.createdAt,
      status: myGroup ? myGroup.status : 'none'
    }

    return groupDetail
  })
}