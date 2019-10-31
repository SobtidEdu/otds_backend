'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.get('/:id', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params } = request
    
    const user = await fastify.mongoose.User.findOne({ _id: params.id }).select(["-password", "-groups"])

    return Object.assign(user, {
      profileImage: fastify.storage.getUrlProfileImage(user.profileImage)
    })
  })
}
