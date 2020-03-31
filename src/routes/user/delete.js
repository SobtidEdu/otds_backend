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
    
    await Promise.all([
      fastify.mongoose.User.remove({ _id: userId }),
      fastify.mongoose.Group.deleteMany({ owner: userId }),
      fastify.mongoose.Group.updateMany({ 'students.userInfo': userId }, {
        $pull: { students: { userInfo: userId } }
      }),
      fastify.mongoose.Testing.deleteMany({ userId })
    ])

    return { message: 'ลบผู้ใช้งานเรียบร้อย' }
  })
}
