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

    const baseOptions = [
      {
        $project: { 
          _id: 1,
          profileImage: 1,
          name: { $concat: [ "$prefixName", " ", "$firstName", " ", "$lastName" ] },
          "school.name": 1,
          createdAt: 1,
          lastLoggedInAt: 1,
          email: 1,
          status: 1,
          isBanned: 1,
          isConfirmationEmail: 1,
          isSeenModified: 1,
        }
      }
    ]
    
    const user = await fastify.mongoose.User.findOne({ _id: params.id }).select(["-password", "-groups"])

    return Object.assign(user, {
      profileImage: fastify.storage.getUrlProfileImage(user.profileImage)
    })
  })
}
