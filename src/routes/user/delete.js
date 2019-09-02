'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.delete('/:userId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { userId } = request.params
    
    await fastify.mongoose.User.remove({ _id: userId })

    return { message: 'ลบผู้ใช้งานเรียบร้อย' }
  })
}
