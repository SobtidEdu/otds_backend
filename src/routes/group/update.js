'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.patch('/:groupId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ],
    bodyLimit: 2200000 // limit 2.2 mb
  }, async (request) => {
    
    const { body, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId })
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))
    
    group.name = body.name

    if (body.logo && body.logo.includes('data:image/')) {
      const filename = `group-${group._id}`
      const imageInfo = fastify.storage.diskGroupLogo(body.logo, filename)
      
      group.logo = imageInfo.fileName
    }

    const result = await fastify.mongoose.Group.findOneAndUpdate({ _id: params.groupId }, group)
    
    return { message: fastify.message('group.updated') }
  })
}