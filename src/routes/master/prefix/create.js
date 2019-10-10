'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  fastify.post('/', 
  { 
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request) => {
    const { body } = request
    
    const prefix = await fastify.mongoose.Prefix.findOne({})

    const { data } = prefix
    data.push({
      name: body.name,
      visible: {
        teacher: false,
        student: false
      }
    })

    prefix.data = data
    await prefix.save()

    return { message: 'สร้างคำนำหน้าชื่อสำเร็จ' }
  })
}