'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.delete('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { userIds } = request.body
    
    await fastify.mongoose.User.remove({ _id: { $in: userIds }})

    return { message: 'ลบผู้ใช้งานเรียบร้อย' }
  })
}
